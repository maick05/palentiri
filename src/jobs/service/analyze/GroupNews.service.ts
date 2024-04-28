import { Injectable } from '@nestjs/common';
import { ArticleDocument } from 'src/schemas/articles.schema';
import { ChatGptService } from 'src/ia/ChatGpt.service';
import { GroupedNewsGptResponse } from 'src/interface/ChatGptResponse';
import { AbstractAnalyzeNewsService } from './AbstractAnalyzeNews.service';

@Injectable()
export class GroupNewsService extends AbstractAnalyzeNewsService {
  constructor(private readonly chatGptService: ChatGptService) {
    super();
  }

  async execute(
    articles: ArticleDocument[],
  ): Promise<GroupedNewsGptResponse[]> {
    const chunkSize = 10;
    const articleChunks = [];
    const allResponses: GroupedNewsGptResponse[] = [];

    for (let i = 0; i < articles.length; i += chunkSize)
      articleChunks.push(articles.slice(i, i + chunkSize));

    for (const chunk of articleChunks) {
      const chatGptResponse = await this.chatGptService.groupNews(chunk);
      const responses = this.parseResponseToJSON<GroupedNewsGptResponse>(
        chatGptResponse.choices[0].message.content,
      );
      allResponses.push(...responses);
    }
    return allResponses;
  }
}
