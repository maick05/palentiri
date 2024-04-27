import { Injectable } from '@nestjs/common';
import { ChatGptClient } from './ChatGptClient';
import { ArticleDocument } from 'src/schemas/articles.schema';
import { ChatGptResponse } from 'src/interface/ChatGptResponse';

@Injectable()
export class ChatGptService {
  constructor(private chatGptClient: ChatGptClient) {}

  async analyzeCategoryNews(
    newsArray: ArticleDocument[],
  ): Promise<ChatGptResponse> {
    const prompt = this.buildPrompt(newsArray);
    console.log(prompt);
    return this.chatGptClient.generateTextResponse(prompt);
  }

  private buildPrompt(newsArray: ArticleDocument[]): string {
    let prompt =
      'Dadas as seguintes notícias, identifique quais não são sobre política ou economia e retorne um array com o campo id com os id da noticia inválida e o campo category com categoria correta para cada uma:';
    newsArray.forEach((news) => {
      prompt += `\nID: ${news._id}, Título: ${news.title} ${
        news.resume ? ', Descrição: ' + news.resume : ''
      }`;
    }); //
    return prompt;
  }
}
