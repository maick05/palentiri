import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticlesSchema } from 'src/schemas/articles.schema';
import { ArticlesRepository } from 'src/repository/Articles.repository';
import { ChatGptService } from './ChatGpt.service';
import { ChatGptClient } from './ChatGptClient';
import { InjectionTokenEnum } from 'src/enum/InjectionTokenEnum';
import { ConfigService } from '@nestjs/config';
import { AnalyzeNewsJobService } from 'src/jobs/service/AnalyzeNewsJob.service';
import { AnalyzeCategoryNewsService } from 'src/jobs/service/analyze/AnalyzeCategoryNews.service';
import { GroupNewsService } from 'src/jobs/service/analyze/GroupNews.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticlesSchema }]),
  ],
  controllers: [],
  providers: [
    ArticlesRepository,
    AnalyzeCategoryNewsService,
    GroupNewsService,
    AnalyzeNewsJobService,
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
    AnalyzeCategoryNewsService,
    GroupNewsService,
    AnalyzeNewsJobService,
    ChatGptService,
    ChatGptClient,
  ],
})
export class ChatGptModule {}
