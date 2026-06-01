import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LeadController } from "./lead.controller";
import { LeadService } from "./lead.service";
import { Lead } from "./entities/lead.entity";
import { LeadProductMaster } from "./entities/lead-product-master.entity";
import { LeadAddress } from "./entities/lead-address.entity";
import { Notes } from "./entities/notes.entity";
import { ReferralTracking } from "./entities/referral-tracking.entity";
import { JwtService } from "@nestjs/jwt";
import { UserSession } from "../user/entities/user-session.entity";
import { ResponseService } from "src/common/response.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      LeadProductMaster,
      LeadAddress,
      Notes,
      ReferralTracking,
      UserSession,
    ]),
  ],
  controllers: [LeadController],
  providers: [LeadService, JwtService, ResponseService],
  exports: [LeadService],
})
export class LeadModule {}
