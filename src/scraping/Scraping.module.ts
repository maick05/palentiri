import { Module } from '@nestjs/common';
import { OesteScraperService } from './publishers/OesteScraper.service';
import { CrusoeScraperService } from './publishers/CrusoeScraper.service';
import { AntagonistaScraperService } from './publishers/AntagonistaScraper.service';
import { GazetaDoPovoScraperService } from './publishers/GazetaDoPovoScraper.service';
import { Poder360ScraperService } from './publishers/Poder360Scraper.service';
import { GazetaLibertariaScraperService } from './publishers/GazetaLibertariaScraper.service';
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
