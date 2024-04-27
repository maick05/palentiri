import { Injectable } from '@nestjs/common';
import { AbstractService } from '@devseeder/typescript-commons';
import { ArticlesRepository } from 'src/repository/Articles.repository';
import { ArticleDocument } from 'src/schemas/articles.schema';
import { JobDataResult } from 'src/interface/JobResult';
import { ChatGptService } from 'src/ia/ChatGpt.service';
import { InvalidCategoryGptResponse } from 'src/interface/ChatGptResponse';
import {
  VALID_EXTRA_CATEGORIES,
  VALID_KEY_WORDS,
} from 'src/constants/articleFilter';

@Injectable()
export class AnalyzeCategoryNewsJobService extends AbstractService {
  constructor(
    private readonly articlesRepository: ArticlesRepository,
    private readonly chatGptService: ChatGptService,
  ) {
    super();
  }

  async execute(): Promise<JobDataResult<any>> {
    const articles = await this.getCollectedArticles();
    const chunkSize = 35;
    const articleChunks = [];
    const allResponses: InvalidCategoryGptResponse[] = [];

    for (let i = 0; i < articles.length; i += chunkSize)
      articleChunks.push(articles.slice(i, i + chunkSize));

    for (const chunk of articleChunks) {
      const chatGptResponse = await this.chatGptService.analyzeCategoryNews(
        chunk,
      );

      this.logger.log(chatGptResponse.choices[0].message.content);
      const responses = this.parseResponseToJSON(
        chatGptResponse.choices[0].message.content,
      );
      allResponses.push(...responses);
    }

    return this.mapOutput(
      articles,
      this.filterInvalidArticles(articles, allResponses),
    );
  }

  private async getCollectedArticles(): Promise<ArticleDocument[]> {
    const articlesDB = await this.articlesRepository.find(
      {
        classified: false,
        grouped: false,
        active: true,
        publisher: {
          $in: ['revista_crusoe', 'antagonista', 'gazeta_povo', 'poder360'],
        },
      },
      { _id: 1, title: 1, resume: 1 },
    );

    this.logger.log(`Articles found: ${articlesDB.length}`);

    return articlesDB;
  }

  private mapOutput(
    articles: ArticleDocument[],
    chatGptResponse: InvalidCategoryGptResponse[],
  ): JobDataResult<InvalidCategoryGptResponse[]> {
    return {
      data: chatGptResponse.map((item) => ({
        ...item,
        ...articles.find((article) => article._id == item.id),
      })),
      result: {
        collectedArticles: articles.length,
        invalidCategoryArticles: chatGptResponse.length,
        groupedNews: 0,
        oldArticles: 0,
      },
    };
  }

  private parseResponseToJSON(content: string): InvalidCategoryGptResponse[] {
    try {
      const str = content.replaceAll('`', '').replaceAll('json', '').trim();
      return JSON.parse(str) as InvalidCategoryGptResponse[];
    } catch (err) {
      console.log(err);
      this.logger.error(`Erro ao fazer parse da resposta: ${err}`);
      return [];
    }
  }

  private filterInvalidArticles(
    articles: ArticleDocument[],
    items: InvalidCategoryGptResponse[],
  ): InvalidCategoryGptResponse[] {
    return items.filter((item) => {
      const article = articles.find((art) => art._id == item.id);
      if (!article) return false;
      return (
        !VALID_EXTRA_CATEGORIES.includes(item.category.toLowerCase()) &&
        !this.containValidKeyWorld(article.title) &&
        !this.containValidKeyWorld(article.resume)
      );
    });
  }

  private containValidKeyWorld(str: string): boolean {
    if (!str) return false;
    const lowerCaseStr = str.toLowerCase();
    return VALID_KEY_WORDS.some((word) => {
      const lowerCaseWord = word.toLowerCase();
      const regex = new RegExp(`\\b${lowerCaseWord}\\b`, 'i');
      return regex.test(lowerCaseStr);
    });
  }
}
