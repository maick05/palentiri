import { Module } from '@nestjs/common';
import { OesteScraperService } from './orgs/OesteScraper.service';
import { CrusoeScraperService } from './orgs/CrusoeScraper.service';
import { AntagonistaScraperService } from './orgs/AntagonistaScraper.service';
import { GazetaDoPovoScraperService } from './orgs/GazetaDoPovoScraper.service';
import { Poder360ScraperService } from './orgs/Poder360Scraper.service';
import { GazetaLibertariaScraperService } from './orgs/GazetaLibertariaScraper.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticlesSchema } from 'src/schemas/articles.schema';
import { ArticlesRepository } from 'src/repository/Articles.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticlesSchema }]),
  ],
  controllers: [],
  providers: [
    ArticlesRepository,
    OesteScraperService,
    CrusoeScraperService,
    AntagonistaScraperService,
    GazetaDoPovoScraperService,
    Poder360ScraperService,
    GazetaLibertariaScraperService,
  ],
  exports: [
    ArticlesRepository,
    OesteScraperService,
    CrusoeScraperService,
    AntagonistaScraperService,
    GazetaDoPovoScraperService,
    Poder360ScraperService,
    GazetaLibertariaScraperService,
  ],
})
export class ScrapingModule {}
