import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectionTokenEnum } from 'src/enum/InjectionTokenEnum';
import { ChatGptResponse } from 'src/interface/ChatGptResponse';

@Injectable()
export class ChatGptClient {
  constructor(
    @Inject(InjectionTokenEnum.GLOBAL_CHATGPT_API_URL) private url: string,
    @Inject(InjectionTokenEnum.GLOBAL_CHATGPT_API_KEY) private apiKey: string,
    @Inject(ConfigService) private configService: ConfigService,
  ) {}

  async generateTextResponse(prompt: string): Promise<ChatGptResponse> {
    try {
      const response = await axios.post(
        this.url,
        {
          model: await this.configService.get('chatgpt.api.model'),
          messages: [
            {
              role: 'system',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.5,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao solicitar a API da OpenAI:', error);
      throw error;
    }
  }

  private buildPrompt(newsArray: any[]): string {
    let prompt =
      'Dadas as seguintes notícias, identifique quais não são sobre política ou economia e indique a categoria correta para cada uma:';
    newsArray.forEach((news) => {
      prompt += `\nID: ${news.id}, Título: ${news.title}, Descrição: ${news.description}`;
    });
    return prompt;
  }
}
