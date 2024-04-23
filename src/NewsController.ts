import { Controller, Get, Param } from '@nestjs/common';
import { OesteScraperService } from './scraping/oeste/OesteScraper.service';

@Controller('news')
export class NewsController {
  constructor(private readonly oesteService: OesteScraperService) {}

  @Get('/:sufix')
  scrapeBySufix(@Param('sufix') sufix?: string) {
    return this.oesteService.scrapeNewsList(sufix);
  }

  @Get('/')
  scrape() {
    return this.oesteService.scrapeNewsList();
  }
}
