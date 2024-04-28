import { Injectable } from '@nestjs/common';
import { AbstractService } from '@devseeder/typescript-commons';
import { JobDataResult } from 'src/interface/JobResult';
import { ArticlesRepository } from 'src/repository/Articles.repository';
import { ArticleDocument } from 'src/schemas/articles.schema';
import {
  GroupedNewsGptResponse,
  InvalidCategoryGptResponse,
} from 'src/interface/ChatGptResponse';
import { AnalyzeCategoryNewsService } from './analyze/AnalyzeCategoryNews.service';
import { GroupNewsService } from './analyze/GroupNews.service';

@Injectable()
export class AnalyzeNewsJobService extends AbstractService {
  constructor(
    private readonly articlesRepository: ArticlesRepository,
    private readonly analyzeCategoryNewsService: AnalyzeCategoryNewsService,
    private readonly groupNewsService: GroupNewsService,
  ) {
    super();
  }

  async execute(): Promise<JobDataResult<any>> {
    const { articlesDB, articlesCategory } = await this.getCollectedArticles();
    const { filteredArticles } = await this.analyzeCategory(
      articlesDB,
      articlesCategory,
    );
    return this.mapOutput(articlesDB, filteredArticles);
  }

  private async analyzeCategory(
    articlesDB: ArticleDocument[],
    articlesCategory: ArticleDocument[],
  ): Promise<{
    validArticles: ArticleDocument[];
    filteredArticles: InvalidCategoryGptResponse[];
  }> {
    this.logger.log(`Analyzing Categories...`);
    const filteredArticles = await this.analyzeCategoryNewsService.execute(
      articlesCategory,
    );
    const validArticles = await this.validateCategoryInDatabase(
      articlesDB,
      filteredArticles,
    );

    this.logger.log(`Invalid Category: ${filteredArticles.length}`);

    return { validArticles, filteredArticles };
  }

  private async groupNews(
    validArticles: ArticleDocument[],
  ): Promise<GroupedNewsGptResponse[]> {
    this.logger.log(`Grouping News...`);

    const groupedNews = await this.groupNewsService.execute(validArticles);
    // const validArticles = await this.validateCategoryInDatabase(
    //   articlesDB,
    //   filteredArticles,
    // );
    this.logger.log(`Grouped News: ${groupedNews.length}`);

    return groupedNews;
  }

  private async getCollectedArticles(): Promise<{
    articlesDB: ArticleDocument[];
    articlesCategory: ArticleDocument[];
  }> {
    const articlesDB = await this.articlesRepository.find(
      {
        classified: false,
        grouped: false,
        active: true,
      },
      { _id: 1, title: 1, resume: 1 },
    );

    this.logger.log(`Articles found: ${articlesDB.length}`);

    return {
      articlesDB,
      articlesCategory: articlesDB.filter((art) =>
        ['revista_crusoe', 'antagonista', 'gazeta_povo', 'poder360'].includes(
          art.publisher,
        ),
      ),
    };
  }

  private async validateCategoryInDatabase(
    articles: ArticleDocument[],
    reponses: InvalidCategoryGptResponse[],
  ): Promise<ArticleDocument[]> {
    const validArticles = [];
    for await (const article of articles) {
      const invalid = reponses.find(
        (item) => item.id === article._id.toString(),
      );
      if (!invalid) {
        validArticles.push(article);
        continue;
      }
      this.logger.log(
        `Invalidating '${article._id}' ${JSON.stringify(invalid)}`,
      );
      await this.articlesRepository.updateOneById(article._id, {
        classified: true,
        valid: {
          isValid: false,
          invalidator: 'ChatGPT',
          invalidationReason: `Invalid Category '${invalid.category}'`,
        },
      });
    }

    for await (const article of validArticles)
      await this.articlesRepository.updateOneById(article._id, {
        classified: true,
        valid: {
          isValid: true,
        },
      });
    return validArticles;
  }

  private mapOutput(
    articles: ArticleDocument[],
    chatGptResponse: any[],
  ): JobDataResult<any[]> {
    return {
      data: chatGptResponse.map((item) => ({
        ...item,
        ...articles.find((article) => article._id == item.id),
      })),
      result: {
        collectedArticles: articles.length,
        invalidCategoryArticles: chatGptResponse.length,
      },
    };
  }
}
