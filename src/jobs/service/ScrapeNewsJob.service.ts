import { BadRequestException, Injectable } from '@nestjs/common';
import { ArticleDto } from 'src/interface/Article';
import { AntagonistaScraperService } from 'src/scraping/orgs/AntagonistaScraper.service';
import { CrusoeScraperService } from 'src/scraping/orgs/CrusoeScraper.service';
import { GazetaDoPovoScraperService } from 'src/scraping/orgs/GazetaDoPovoScraper.service';
import { GazetaLibertariaScraperService } from 'src/scraping/orgs/GazetaLibertariaScraper.service';
import { OesteScraperService } from 'src/scraping/orgs/OesteScraper.service';
import { Poder360ScraperService } from 'src/scraping/orgs/Poder360Scraper.service';
import { AbstractService, DateHelper } from '@devseeder/typescript-commons';
import { ArticlesRepository } from 'src/repository/Articles.repository';
import { Article } from 'src/schemas/articles.schema';
import { JobDataResult } from 'src/interface/JobResult';
import { link } from 'fs';

@Injectable()
export class ScrapeNewsJobService extends AbstractService {
  constructor(
    private readonly articlesRepository: ArticlesRepository,
    private readonly oesteService: OesteScraperService,
    private readonly crusoeService: CrusoeScraperService,
    private readonly antagonistaService: AntagonistaScraperService,
    private readonly gazetaDoPovoService: GazetaDoPovoScraperService,
    private readonly poder360Service: Poder360ScraperService,
    private readonly gazetaLibertariaService: GazetaLibertariaScraperService,
  ) {
    super();
  }

  async execute(
    publisher: string,
    jobId: string,
    sufix = '',
  ): Promise<JobDataResult<ArticleDto[]>> {
    const articles = await this.executeScraper(publisher, sufix);
    const savedArticles = await this.saveArticles(jobId, articles);
    return this.mapOutput(savedArticles);
  }

  private async saveArticles(
    jobId: string,
    articles: ArticleDto[],
  ): Promise<ArticleDto[]> {
    const savedArticles = [];
    this.logger.log('Saving articles...');
    for await (const item of articles) {
      if (await this.checkArticleOnDateBase(item)) continue;
      await this.saveArticle(jobId, item);
      savedArticles.push(item);
    }
    this.logger.log('Articles saved.');
    return savedArticles;
  }

  private async saveArticle(jobId: string, item: ArticleDto): Promise<void> {
    try {
      const article = new Article();
      article.jobId = jobId;
      article.title = item.title;
      article.resume = item.resume;
      article.author = item.author;
      article.category = item.category;
      article.newsDate = new Date(item.date);
      article.publisher = item.publisher;
      article.orgId = item.orgId;
      article.link = item.link;
      article.grouped = false;
      article.jobDate = DateHelper.getLocaleDateNow();
      article.classified = false;
      article.active = true;

      await this.articlesRepository.create(article);
    } catch (err) {
      this.logger.error(`Erro ao salvar artigo ${JSON.stringify(item)}`);
    }
  }

  private async checkArticleOnDateBase(article: ArticleDto): Promise<boolean> {
    const articleDB = await this.articlesRepository.count({
      $or: [
        {
          orgId: article.orgId,
          publisher: article.publisher,
        },
        { link },
      ],
    });
    return articleDB > 0;
  }

  async executeScraper(publisher: string, sufix = ''): Promise<ArticleDto[]> {
    switch (publisher) {
      case 'oeste':
        return this.oesteService.scrapeNewsList(sufix);
      case 'crusoe':
        return this.crusoeService.scrapeNewsList();
      case 'antagonista':
        return this.antagonistaService.scrapeNewsList(sufix);
      case 'gazeta_povo':
        return this.gazetaDoPovoService.scrapeNewsList();
      case 'poder360':
        return this.poder360Service.scrapeNewsList();
      case 'gazeta_libertaria':
        return this.gazetaLibertariaService.scrapeNewsList();
      default:
        throw new BadRequestException('Invalid News Org Name.');
    }
  }

  private mapOutput(articles: ArticleDto[]): JobDataResult<ArticleDto[]> {
    return {
      data: articles,
      result: {
        collectedNews: articles.length,
      },
    };
  }
}
