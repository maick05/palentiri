import { Module } from '@nestjs/common';
import { OesteScraperService } from './orgs/OesteScraper.service';
import { CrusoeScraperService } from './orgs/CrusoeScraper.service';
import { ScrapingController } from 'src/ScrapingController';
import { AntagonistaScraperService } from './orgs/AntagonistaScraper.service';
import { GazetaDoPovoScraperService } from './orgs/GazetaDoPovoScraper.service';

@Module({
  controllers: [ScrapingController],
  providers: [
    OesteScraperService,
    CrusoeScraperService,
    AntagonistaScraperService,
    GazetaDoPovoScraperService,
  ],
  exports: [
    OesteScraperService,
    CrusoeScraperService,
    AntagonistaScraperService,
    GazetaDoPovoScraperService,
  ],
})
export class ScrapingModule {}
