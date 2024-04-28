import { Injectable } from '@nestjs/common';
import { ArticleDocument } from 'src/schemas/articles.schema';
import { ChatGptService } from 'src/ia/ChatGpt.service';
import { InvalidCategoryGptResponse } from 'src/interface/ChatGptResponse';
import {
  VALID_EXTRA_CATEGORIES,
  VALID_KEY_WORDS,
} from 'src/constants/articleFilter';
import { AbstractAnalyzeNewsService } from './AbstractAnalyzeNews.service';

@Injectable()
export class AnalyzeCategoryNewsService extends AbstractAnalyzeNewsService {
  constructor(private readonly chatGptService: ChatGptService) {
    super();
  }

  async execute(
    articles: ArticleDocument[],
  ): Promise<InvalidCategoryGptResponse[]> {
    const chunkSize = 35;
    const articleChunks = [];
    const allResponses: InvalidCategoryGptResponse[] = [];

    for (let i = 0; i < articles.length; i += chunkSize)
      articleChunks.push(articles.slice(i, i + chunkSize));

    for (const chunk of articleChunks) {
      const chatGptResponse = await this.chatGptService.analyzeCategoryNews(
        chunk,
      );
      const responses = this.parseResponseToJSON<InvalidCategoryGptResponse>(
        chatGptResponse.choices[0].message.content,
      );
      allResponses.push(...responses);
    }
    return this.filterInvalidArticles(articles, allResponses);
  }

  private filterInvalidArticles(
    articles: ArticleDocument[],
    items: InvalidCategoryGptResponse[],
  ): InvalidCategoryGptResponse[] {
    return items.filter((item) => {
      const article = articles.find((art) => art._id.toString() == item.id);
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
