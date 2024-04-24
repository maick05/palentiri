import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { OesteScraperService } from './scraping/orgs/OesteScraper.service';
import { Article } from './interface/Article';
import { CrusoeScraperService } from './scraping/orgs/CrusoeScraper.service';
import { AntagonistaScraperService } from './scraping/orgs/AntagonistaScraper.service';
import { GazetaDoPovoScraperService } from './scraping/orgs/GazetaDoPovoScraper.service';
import { Poder360ScraperService } from './scraping/orgs/Poder360Scraper.service';

@Controller('scraping')
export class ScrapingController {
  constructor(
    private readonly oesteService: OesteScraperService,
    private readonly crusoeService: CrusoeScraperService,
    private readonly antagonistaService: AntagonistaScraperService,
    private readonly gazetaDoPovoService: GazetaDoPovoScraperService,
    private readonly poder360Service: Poder360ScraperService,
  ) {}

  @Get('/:company/:sufix')
  scrapeBySufix(
    @Param('company') company: string,
    @Param('sufix') sufix?: string,
  ) {
    return this.scrapeNewsList(company, sufix);
  }

  @Get('/:company')
  scrape(@Param('company') company: string) {
    return this.scrapeNewsList(company);
  }

  private async scrapeNewsList(
    company: string,
    sufix = '',
  ): Promise<Article[]> {
    switch (company) {
      case 'oeste':
        return this.oesteService.scrapeNewsList(sufix);
      case 'crusoe':
        return this.crusoeService.scrapeNewsList();
      case 'antagonista':
        return this.antagonistaService.scrapeNewsList(sufix);
      case 'gazeta':
        return this.gazetaDoPovoService.scrapeNewsList();
      case 'poder360':
        return this.poder360Service.scrapeNewsList();
      default:
        throw new BadRequestException('Invalid News Org Name.');
    }
  }
}
