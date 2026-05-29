import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LeadActivity } from "./entities/lead-activity.entity";

@Module({
  imports: [TypeOrmModule.forFeature([LeadActivity])],
  providers: [],
  exports: [],
})
export class ActivityModule {}
