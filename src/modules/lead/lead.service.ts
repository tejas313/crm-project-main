import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Lead, LeadStage } from "./entities/lead.entity";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { User } from "../user/entities/user.entity";
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
    alternateEmail?: string
  ): Promise<{ isDuplicate: boolean; duplicateLeadId?: number }> {
    // Build query to check for duplicates
    const queryBuilder = this.leadRepository
      .createQueryBuilder("leads")
      .where("leads.is_deleted = :isDeleted", { isDeleted: 0 });

    // Check primary phone
    queryBuilder.andWhere(
      "(leads.phone = :phone OR leads.alternate_phone = :phone)",
      { phone }
    );

    // Check alternate phone if provided
    if (alternatePhone) {
      queryBuilder.orWhere(
        "(leads.phone = :alternatePhone OR leads.alternate_phone = :alternatePhone)",
        { alternatePhone }
      );
    }

    // Check email if provided
    if (email) {
      queryBuilder.orWhere(
        "(leads.email = :email OR leads.alternate_email = :email)",
        { email }
      );
    }

    // Check alternate email if provided
    if (alternateEmail) {
      queryBuilder.orWhere(
        "(leads.email = :alternateEmail OR leads.alternate_email = :alternateEmail)",
        { alternateEmail }
      );
    }

    const duplicateLead = await queryBuilder.getRawOne();

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
   * Create manual lead by agent
   */
  async createManualLead(dto: CreateLeadDto, userId: number): Promise<any> {
    try {
      // Validate pregnancy EDD if provided (no backdating)
      if (dto.pregnancy_edd) {
        if (!this.validatePregnancyEDD(dto.pregnancy_edd)) {
          return {
            success: false,
            message: "PREGNANCY_EDD_CANNOT_BE_BACKDATED",
          };
        }
      }

      // Check for duplicate leads
      const duplicateCheck = await this.checkDuplicateLead(
        dto.phone,
        dto.email,
        dto.alternate_phone,
        dto.alternate_email
      );

      if (duplicateCheck.isDuplicate) {
        throw new Error("DUPLICATE_LEAD_EXISTS");
      }

      // Convert interested products array to comma-separated string
      const interestedProductsStr = dto.interested_products
        ? dto.interested_products.join(", ")
        : null;

      // Create lead entity
      const lead = this.leadRepository.create({
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        phone: dto.phone,
        alternate_phone: dto.alternate_phone,
        alternate_email: dto.alternate_email,
        fk_lead_source_id: dto.source_id,
        fk_lead_medium_id: dto.medium_id,
        campaign_name: dto.campaign_name,
        campaign_type: dto.campaign_type,
        pregnancy_edd: dto.pregnancy_edd ? new Date(dto.pregnancy_edd) : null,
        referrer_crm_number: dto.referrer_crm_number,
        interested_product: interestedProductsStr,
        note: dto.note || null,
        fk_lead_status_id: 1, // Default as per URS
        lead_stage: LeadStage.NEW, // Default stage
        fk_owner_id: userId, // Owner is the user creating the lead
        created_by: userId,
        created_at: new Date(),
        is_manually: 1,
      });

      // Save lead
      const savedLead = await this.leadRepository.save(lead);

      // TODO: As per URS, integrate with Stemcell app to create corresponding lead
      // and get unique Lead ID from Stemcell

      return {
        message: "LEAD_CREATED_SUCCESSFULLY",
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
        date_from,
        date_to,
        pregnancy_edd_from,
        pregnancy_edd_to,
        state_id,
        city_id,
        lead_stage,
        is_manually,
        campaign_name,
      } = filters;

      const page = Number(pageNumber);
      const limit = Number(pageLimit);
      const skip = (page - 1) * limit;

      // Build query with joins
      let query = this.leadRepository
        .createQueryBuilder("leads")
        .leftJoin(User, "owner_user", "owner_user.id = leads.fk_owner_id")
        .select([
          "leads.id as id",
          "leads.lead_id as lead_id",
          "leads.first_name as first_name",
          "leads.last_name as last_name",
          "leads.phone as phone",
          "leads.email as email",
          "leads.lead_source as source",
          "leads.medium as medium",
          "leads.campaign_name as lead_name",
          "leads.interested_product as product",
          "leads.pregnancy_edd as edd",
          "leads.call_attempt_count as calls",
          "leads.lead_score as lead_score",
          "leads.lead_status as lead_status",
          "leads.lead_stage as lead_stage",
          "leads.created_at as created_at",
          "leads.last_contacted_at as last_contacted_at",
          "COALESCE(owner_agent.first_name, owner_manager.first_name) as owner_first_name",
          "COALESCE(owner_agent.last_name, owner_manager.last_name) as owner_last_name",
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
          "(owner_agent.fk_manager_id = :managerId OR leads.fk_owner_id = :ownerId)",
          { managerId: userId, ownerId: userId }
        );
      }

      // Search filter (name, email, phone)
      if (search) {
        query = query.andWhere(
          "(leads.first_name LIKE :search OR leads.last_name LIKE :search OR leads.email LIKE :search OR leads.phone LIKE :search OR leads.campaign_name LIKE :search)",
          { search: `%${search}%` }
        );
      }

      // Lead status filter
      if (lead_status) {
        if (Array.isArray(lead_status)) {
          query = query.andWhere("leads.lead_status IN (:...statuses)", {
            statuses: lead_status,
          });
        } else {
          query = query.andWhere("leads.lead_status = :status", {
            status: lead_status,
          });
        }
      }

      // Lead source filter
      if (lead_source) {
        if (Array.isArray(lead_source)) {
          query = query.andWhere("leads.lead_source IN (:...sources)", {
            sources: lead_source,
          });
        } else {
          query = query.andWhere("leads.lead_source = :source", {
            source: lead_source,
          });
        }
      }

      // Medium filter
      if (medium) {
        if (Array.isArray(medium)) {
          query = query.andWhere("leads.medium IN (:...mediums)", {
            mediums: medium,
          });
        } else {
          query = query.andWhere("leads.medium = :medium", { medium });
        }
      }

      // Owner filter
      if (owner_id) {
        if (Array.isArray(owner_id)) {
          query = query.andWhere("leads.fk_owner_id IN (:...ownerIds)", {
            ownerIds: owner_id,
          });
        } else {
          query = query.andWhere("leads.fk_owner_id = :ownerId", {
            ownerId: owner_id,
          });
        }
      }

      // Date range filter (created_at)
      if (date_from) {
        query = query.andWhere("leads.created_at >= :dateFrom", {
          dateFrom: new Date(date_from),
        });
      }
      if (date_to) {
        query = query.andWhere("leads.created_at <= :dateTo", {
          dateTo: new Date(date_to),
        });
      }

      // Pregnancy EDD range filter
      if (pregnancy_edd_from) {
        query = query.andWhere("leads.pregnancy_edd >= :eddFrom", {
          eddFrom: new Date(pregnancy_edd_from),
        });
      }
      if (pregnancy_edd_to) {
        query = query.andWhere("leads.pregnancy_edd <= :eddTo", {
          eddTo: new Date(pregnancy_edd_to),
        });
      }

      // State filter
      if (state_id) {
        if (Array.isArray(state_id)) {
          query = query.andWhere("leads.state_id IN (:...stateIds)", {
            stateIds: state_id,
          });
        } else {
          query = query.andWhere("leads.state_id = :stateId", {
            stateId: state_id,
          });
        }
      }

      // City filter
      if (city_id) {
        if (Array.isArray(city_id)) {
          query = query.andWhere("leads.city_id IN (:...cityIds)", {
            cityIds: city_id,
          });
        } else {
          query = query.andWhere("leads.city_id = :cityId", {
            cityId: city_id,
          });
        }
      }

      // Lead stage filter
      if (lead_stage) {
        if (Array.isArray(lead_stage)) {
          query = query.andWhere("leads.lead_stage IN (:...stages)", {
            stages: lead_stage,
          });
        } else {
          query = query.andWhere("leads.lead_stage = :stage", {
            stage: lead_stage,
          });
        }
      }

      // Manual lead filter
      if (is_manually !== undefined && is_manually !== null) {
        query = query.andWhere("leads.is_manually = :isManually", {
          isManually: Number(is_manually),
        });
      }

      // Campaign name filter
      if (campaign_name) {
        query = query.andWhere("leads.campaign_name LIKE :campaignName", {
          campaignName: `%${campaign_name}%`,
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
