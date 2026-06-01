import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Brackets } from "typeorm";
import { Lead, LeadStage } from "./entities/lead.entity";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { RoleType } from "../user/entities/role-details.entity";

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>
  ) {}

  /**
   * Check for duplicate leads based on phone number and email
   * As per URS: Duplicate check against primary/secondary phone numbers and email IDs
   */
  private async checkDuplicateLead(
    phone: string,
    email?: string,
    alternatePhone?: string,
    alternateEmail?: string,
    excludeLeadId?: number
  ): Promise<{ isDuplicate: boolean; duplicateLeadId?: number }> {
    // Build query to check for duplicates
    const queryBuilder = this.leadRepository
      .createQueryBuilder("leads")
      .where("leads.is_deleted = :isDeleted", { isDeleted: 0 });

    if (excludeLeadId) {
      queryBuilder.andWhere("leads.id != :excludeLeadId", { excludeLeadId });
    }

    // Use Brackets to group all OR conditions for duplicate check
    // This ensures that (is_deleted = 0 AND id != excludeLeadId) applies to all duplicate checks
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("(leads.phone = :phone OR leads.alternate_phone = :phone)", {
          phone,
        });

        // Check alternate phone if provided
        if (alternatePhone) {
          qb.orWhere(
            "(leads.phone = :alternatePhone OR leads.alternate_phone = :alternatePhone)",
            { alternatePhone }
          );
        }

        // Check email if provided
        if (email) {
          qb.orWhere(
            "(leads.email = :email OR leads.alternate_email = :email)",
            { email }
          );
        }

        // Check alternate email if provided
        if (alternateEmail) {
          qb.orWhere(
            "(leads.email = :alternateEmail OR leads.alternate_email = :alternateEmail)",
            { alternateEmail }
          );
        }
      })
    );

    const duplicateLead = await queryBuilder.getOne();

    if (duplicateLead) {
      return {
        isDuplicate: true,
        duplicateLeadId: duplicateLead.id,
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Validate pregnancy EDD - should not accept backdated entries
   */
  private validatePregnancyEDD(eddDate: string): boolean {
    const edd = new Date(eddDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    return edd >= today;
  }

  /**
   * Create or update manual lead
   */
  async addOrEditLead(dto: CreateLeadDto, userId: number): Promise<any> {
    try {
      let lead: Lead;
      if (dto.id) {
        lead = await this.leadRepository.findOne({
          where: { id: dto.id, is_deleted: 0 },
        });
        if (!lead) {
          throw new NotFoundException("LEAD_NOT_FOUND");
        }
      } else {
        lead = new Lead();
        lead.is_manually = 1;
        lead.created_by = userId;
        lead.created_at = new Date();
        lead.fk_lead_status_id = 1; // Default as per URS
        lead.lead_stage = LeadStage.NEW; // Default stage
        lead.fk_owner_id = userId; // Default owner is the user creating the lead
      }

      // Validate pregnancy EDD (no backdating)
      if (!this.validatePregnancyEDD(dto.pregnancy_edd)) {
        throw new BadRequestException("PREGNANCY_EDD_CANNOT_BE_BACKDATED");
      }

      // Check for duplicate leads (excluding current lead if updating)
      const duplicateCheck = await this.checkDuplicateLead(
        dto.phone,
        dto.email,
        dto.alternate_phone,
        dto.alternate_email,
        dto.id
      );

      if (duplicateCheck.isDuplicate) {
        throw new Error("DUPLICATE_LEAD_EXISTS");
      }

      // Update lead fields
      lead.first_name = dto.first_name;
      lead.last_name = dto.last_name;
      lead.email = dto.email;
      lead.phone = dto.phone;
      lead.alternate_phone = dto.alternate_phone;
      lead.alternate_email = dto.alternate_email;
      lead.fk_lead_source_id = dto.source_id;
      lead.fk_lead_medium_id = dto.medium_id;
      lead.campaign_name = dto.campaign_name;
      lead.campaign_type = dto.campaign_type;
      lead.pregnancy_edd = new Date(dto.pregnancy_edd);
      lead.referrer_crm_number = dto.referrer_crm_number;
      lead.fk_interested_product_id = dto.fk_interested_product_id;
      lead.note = dto.note;

      // Conditional updates for non-mandatory fields (only if ID is provided)
      if (dto.id) {
        if (dto.fk_lead_status_id !== undefined) {
          lead.fk_lead_status_id = dto.fk_lead_status_id;
        }
        if (dto.lead_stage !== undefined) {
          lead.lead_stage = dto.lead_stage as LeadStage;
        }
        if (dto.fk_owner_id !== undefined) {
          lead.fk_owner_id = dto.fk_owner_id;
        }
      }

      if (dto.id) {
        lead.modify_at = new Date();
        lead.modify_by = userId;
      }

      // Save lead
      const savedLead = await this.leadRepository.save(lead);

      return {
        message: dto.id
          ? "LEAD_UPDATED_SUCCESSFULLY"
          : "LEAD_CREATED_SUCCESSFULLY",
        data: savedLead,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get lead list with comprehensive filters, pagination, and CSV export
   * Based on the leave list API pattern
   */
  async getLeadList(userId: number, role: string, filters: any) {
    try {
      const {
        pageNumber = 1,
        pageLimit = 10,
        search,
        is_csv,
        // Filter options from the image
        lead_status,
        lead_source,
        medium,
        owner_id,
        lead_stage,
      } = filters;

      const page = Number(pageNumber);
      const limit = Number(pageLimit);
      const skip = (page - 1) * limit;

      // Build query with joins
      let query = this.leadRepository
        .createQueryBuilder("leads")
        .leftJoin("users", "owner_user", "owner_user.id = leads.fk_owner_id")
        .leftJoin(
          "lead_sources_master",
          "sourceMaster",
          "sourceMaster.id = leads.fk_lead_source_id"
        )
        .leftJoin(
          "lead_mediums_master",
          "mediumMaster",
          "mediumMaster.id = leads.fk_lead_medium_id"
        )
        .leftJoin(
          "lead_products_master",
          "productMaster",
          "productMaster.id = leads.fk_interested_product_id"
        )
        .leftJoin(
          "lead_status",
          "statusMaster",
          "statusMaster.id = leads.fk_lead_status_id"
        )
        .select([
          "leads.id as id",
          "leads.lead_id as lead_id",
          "leads.first_name as first_name",
          "leads.last_name as last_name",
          "CONCAT_WS(' ', leads.first_name, leads.last_name) as name",
          "leads.phone as phone",
          "leads.email as email",
          "sourceMaster.name as source",
          "mediumMaster.name as medium",
          "leads.campaign_name as lead_name",
          "productMaster.name as product",
          "leads.pregnancy_edd as edd",
          "leads.call_attempt_count as calls",
          "leads.lead_score as lead_score",
          "statusMaster.name as lead_status",
          "leads.lead_stage as lead_stage",
          "leads.created_at as created_at",
          "CONCAT_WS(' ', owner_user.first_name, owner_user.last_name) as owner_name",
          "owner_user.email as owner_email",
        ])
        .where("leads.is_deleted = :isDeleted", { isDeleted: 0 });

      // Role-based filtering
      if (role === RoleType.AGENT) {
        query = query.andWhere("leads.fk_owner_id = :ownerId", {
          ownerId: userId,
        });
      } else if (role === RoleType.MANAGER) {
        // Manager can see leads owned by their agents
        query = query.andWhere(
          "(owner_user.fk_manager_id = :managerId OR leads.fk_owner_id = :ownerId)",
          { managerId: userId, ownerId: userId }
        );
      }

      // Search filter (name, email, phone)
      if (search) {
        query = query.andWhere(
          "(leads.first_name LIKE :search OR leads.last_name LIKE :search OR leads.email LIKE :search OR leads.phone LIKE :search)",
          { search: `%${search}%` }
        );
      }

      // Lead status filter
      if (lead_status) {
        query = query.andWhere("leads.fk_lead_status_id = :status", {
          status: lead_status,
        });
      }

      // Lead source filter
      if (lead_source) {
        query = query.andWhere("leads.fk_lead_source_id = :source", {
          source: lead_source,
        });
      }

      // Medium filter
      if (medium) {
        query = query.andWhere("leads.fk_lead_medium_id = :medium", {
          medium,
        });
      }

      // Owner filter
      if (owner_id) {
        query = query.andWhere("leads.fk_owner_id = :ownerId", {
          ownerId: owner_id,
        });
      }

      // Lead stage filter
      if (lead_stage) {
        query = query.andWhere("leads.lead_stage = :stage", {
          stage: lead_stage,
        });
      }

      // Default sorting by newest first
      query = query.orderBy("leads.created_at", "DESC");

      // CSV export or paginated response
      if (is_csv == 1) {
        const csvdata = await query.getRawMany();
        return {
          csvdata,
        };
      } else {
        const [data, count] = await Promise.all([
          query.limit(limit).offset(skip).getRawMany(),
          query.getCount(),
        ]);

        const totalPages = Math.ceil(count / limit);

        return {
          data,
          total_count: count,
          current_page: page,
          total_pages: totalPages,
          per_page: limit,
        };
      }
    } catch (error) {
      throw error;
    }
  }
}
