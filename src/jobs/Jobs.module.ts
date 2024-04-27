import { Module } from '@nestjs/common';
import { ScrapingController } from 'src/ScrapingController';
import { JobsService } from './service/Jobs.service';
import { ScrapingModule } from 'src/scraping/scraping.module';
import { ScrapeNewsJobService } from './service/ScrapeNewsJob.service';
import { Job, JobsSchema } from 'src/schemas/jobs.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsRepository } from 'src/repository/Jobs.repository';
import { ChatGptModule } from 'src/ia/ChatGpt.module';
import { ChatGptController } from 'src/ia/ChatGptController';

@Module({
  imports: [
    ScrapingModule,
    ChatGptModule,
    MongooseModule.forFeature([{ name: Job.name, schema: JobsSchema }]),
  ],
  controllers: [ScrapingController, ChatGptController],
  providers: [JobsService, ScrapeNewsJobService, JobsRepository],
  exports: [JobsService, ScrapeNewsJobService, JobsRepository],
})
export class JobsModule {}
