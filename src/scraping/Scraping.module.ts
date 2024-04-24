import { Module } from '@nestjs/common';
import { OesteScraperService } from './orgs/OesteScraper.service';
import { CrusoeScraperService } from './orgs/CrusoeScraper.service';
import { ScrapingController } from 'src/ScrapingController';
import { AntagonistaScraperService } from './orgs/AntagonistaScraper.service';
import { GazetaDoPovoScraperService } from './orgs/GazetaDoPovoScraper.service';
import { Poder360ScraperService } from './orgs/Poder360Scraper.service';
import { GazetaLibertariaScraperService } from './orgs/GazetaLibertariaScraper.service';

@Module({
  controllers: [ScrapingController],
  providers: [
    OesteScraperService,
    CrusoeScraperService,
    AntagonistaScraperService,
    GazetaDoPovoScraperService,
    Poder360ScraperService,
    GazetaLibertariaScraperService,
  ],
  exports: [
    OesteScraperService,
    CrusoeScraperService,
    AntagonistaScraperService,
    GazetaDoPovoScraperService,
    Poder360ScraperService,
    GazetaLibertariaScraperService,
  ],
})
export class ScrapingModule {}
