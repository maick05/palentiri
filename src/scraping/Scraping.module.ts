import { Module } from '@nestjs/common';
import { OesteScraperService } from './orgs/OesteScraper.service';
import { CrusoeScraperService } from './orgs/CrusoeScraper.service';
import { ScrapingController } from 'src/ScrapingController';
import { AntagonistaScraperService } from './orgs/AntagonistaScraper.service';

@Module({
  controllers: [ScrapingController],
  providers: [
    OesteScraperService,
    CrusoeScraperService,
    AntagonistaScraperService,
  ],
  exports: [
    OesteScraperService,
    CrusoeScraperService,
    AntagonistaScraperService,
  ],
})
export class ScrapingModule {}
