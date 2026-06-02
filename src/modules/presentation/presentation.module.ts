import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Presentation } from "./entities/presentation.entity";
import { PresentationController } from "./presentation.controller";
import { PresentationService } from "./presentation.service";
import { ResponseService } from "../../common/response.service";

@Module({
  imports: [TypeOrmModule.forFeature([Presentation])],
  controllers: [PresentationController],
  providers: [PresentationService, ResponseService],
  exports: [PresentationService],
})
export class PresentationModule {}
