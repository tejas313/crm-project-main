import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Presentation } from "./entities/presentation.entity";

@Injectable()
export class PresentationService {
  constructor(
    @InjectRepository(Presentation)
    private presentationRepository: Repository<Presentation>
  ) {}
}
