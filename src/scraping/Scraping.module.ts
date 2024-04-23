import { Module } from '@nestjs/common';
import { OesteScraperService } from './oeste/OesteScraper.service';

@Module({
  providers: [OesteScraperService],
  exports: [OesteScraperService],
})
export class ScrapingModule {}
