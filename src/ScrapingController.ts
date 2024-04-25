import { Body, Controller, Param, Post } from '@nestjs/common';
import { JobsService } from './jobs/service/Jobs.service';
import { JobKeyEnum } from './enum/JobKeyEnum';

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('/:publisher')
  scrapeBySufix(
    @Param('publisher') publisher: string,
    @Body() body?: { sufix?: string },
  ) {
    return this.jobsService.startJob(JobKeyEnum.SCRAPE_NEWS_LIST, {
      publisher,
      sufix: body?.sufix,
    });
  }
}
