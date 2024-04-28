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
    const prompt = this.buildCategoryPrompt(newsArray);
    return this.chatGptClient.generateTextResponse(prompt);
  }

  async groupNews(newsArray: ArticleDocument[]): Promise<ChatGptResponse> {
    const prompt = this.buildGroupedPrompt(newsArray);
    return this.chatGptClient.generateTextResponse(prompt);
  }

  private buildCategoryPrompt(newsArray: ArticleDocument[]): string {
    let prompt =
      'Dadas as seguintes notícias, identifique quais não são sobre política ou economia e retorne apenas um um array JSON (sem nenhum comentário) com o campo id com os id da noticia inválida e o campo category com categoria correta para cada uma (caso não tenha nenhuma, retornar array vazio):';
    newsArray.forEach((news) => {
      prompt += `\nID: ${news._id}, Título: ${news.title} ${
        news.resume ? ', Descrição: ' + news.resume : ''
      }`;
    });
    return prompt;
  }

  private buildGroupedPrompt(newsArray: ArticleDocument[]): string {
    let prompt =
      'Dadas os seguintes artigos, agrupe os artigos que contém a mesma notícia e retorne apenas um array JSON (sem nenhum comentário) com o campo "newsGroup" com o título da notícia agrupada e o campo "ids" com os ids dos artigos relacionados (se houver apenas um artigo retornar apenas ele com a noticia correspondente):';
    newsArray.forEach((news) => {
      prompt += `\nID: ${news._id}, Título: ${news.title} ${
        news.resume ? ', Descrição: ' + news.resume : ''
      }`;
    });
    return prompt;
  }
}
