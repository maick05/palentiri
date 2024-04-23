import { Module } from '@nestjs/common';
import { OesteScraperService } from './journals/OesteScraper.service';
import { CrusoeScraperService } from './journals/CrusoeScraper.service';
import { ScrapingController } from 'src/ScrapingController';
import { AntagonistaScraperService } from './journals/AntagonistaScraper.service';

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
