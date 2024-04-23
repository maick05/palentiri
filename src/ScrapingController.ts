import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { OesteScraperService } from './scraping/journals/OesteScraper.service';
import { Article } from './interface/Article';
import { CrusoeScraperService } from './scraping/journals/CrusoeScraper.service';
import { AntagonistaScraperService } from './scraping/journals/AntagonistaScraper.service';

@Controller('scraping')
export class ScrapingController {
  constructor(
    private readonly oesteService: OesteScraperService,
    private readonly crusoeService: CrusoeScraperService,
    private readonly antagonistaService: AntagonistaScraperService,
  ) {}

  @Get('/:journal/:sufix')
  scrapeBySufix(
    @Param('journal') journal: string,
    @Param('sufix') sufix?: string,
  ) {
    return this.scrapeNewsList(journal, sufix);
  }

  @Get('/:journal')
  scrape(@Param('journal') journal: string) {
    return this.scrapeNewsList(journal);
  }

  private async scrapeNewsList(
    journal: string,
    sufix = '',
  ): Promise<Article[]> {
    switch (journal) {
      case 'oeste':
        return this.oesteService.scrapeNewsList(sufix);
      case 'crusoe':
        return this.crusoeService.scrapeNewsList(sufix);
      case 'antagonista':
        return this.antagonistaService.scrapeNewsList(sufix);
      default:
        throw new BadRequestException('Invalid journal.');
    }
  }
}
