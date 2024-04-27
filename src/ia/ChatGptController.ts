import { Controller, Post } from '@nestjs/common';
import { JobsService } from '../jobs/service/Jobs.service';
import { JobKeyEnum } from '../enum/JobKeyEnum';

@Controller('ia')
export class ChatGptController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('/analyze')
  analyze() {
    return this.jobsService.startJob(JobKeyEnum.ANALYZE_NEWS);
  }
}
