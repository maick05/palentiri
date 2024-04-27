import { Injectable } from '@nestjs/common';
import { AbstractService } from '@devseeder/typescript-commons';
import { ArticlesRepository } from 'src/repository/Articles.repository';
import { ArticleDocument } from 'src/schemas/articles.schema';
import { JobDataResult } from 'src/interface/JobResult';
import { ChatGptService } from 'src/ia/ChatGpt.service';
import { InvalidCategoryGptResponse } from 'src/interface/ChatGptResponse';

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
      const responses = this.parseResponseToJSON(
        chatGptResponse.choices[0].message.content,
      );
      allResponses.push(...responses);
    }
    return this.mapOutput(articles, JSON.stringify(allResponses));
  }

  private async getCollectedArticles(): Promise<ArticleDocument[]> {
    const articlesDB = await this.articlesRepository.find(
      {
        classified: false,
        grouped: false,
        active: true,
      },
      { _id: 1, title: 1, resume: 1 },
    );

    this.logger.log(`Articles found: ${articlesDB.length}`);

    return articlesDB;
  }

  private mapOutput(
    articles: ArticleDocument[],
    chatResponse: string,
  ): JobDataResult<InvalidCategoryGptResponse[]> {
    const chatGptResponse = JSON.parse(
      chatResponse,
    ) as InvalidCategoryGptResponse[];
    return {
      data: chatGptResponse,
      result: {
        collectedArticles: articles.length,
        invalidCategoryArticles: chatGptResponse.length,
        groupedNews: 0,
        oldArticles: 0,
      },
    };
  }

  private parseResponseToJSON(content: string): InvalidCategoryGptResponse[] {
    const str = content.replaceAll('`', '').replaceAll('json', '').trim();
    return JSON.parse(str) as InvalidCategoryGptResponse[];
  }
}
