import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticlesSchema } from 'src/schemas/articles.schema';
import { ArticlesRepository } from 'src/repository/Articles.repository';
import { AnalyzeCategoryNewsJobService } from 'src/jobs/service/AnalyzeCategoryNewsJob.service';
import { ChatGptService } from './ChatGpt.service';
import { ChatGptClient } from './ChatGptClient';
import { InjectionTokenEnum } from 'src/enum/InjectionTokenEnum';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticlesSchema }]),
  ],
  controllers: [],
  providers: [
    ArticlesRepository,
    AnalyzeCategoryNewsJobService,
    ChatGptService,
    ChatGptClient,
    {
      provide: InjectionTokenEnum.GLOBAL_CHATGPT_API_URL,
      useFactory: (configService: ConfigService) =>
        configService.get('chatgpt.api.url'),
      inject: [ConfigService],
    },
    {
      provide: InjectionTokenEnum.GLOBAL_CHATGPT_API_KEY,
      useFactory: (configService: ConfigService) =>
        configService.get('chatgpt.api.key'),
      inject: [ConfigService],
    },
  ],
  exports: [
    ArticlesRepository,
    AnalyzeCategoryNewsJobService,
    ChatGptService,
    ChatGptClient,
  ],
})
export class ChatGptModule {}
