import { Module } from '@nestjs/common';
import { ScrapingModule } from './scraping/scraping.module';
import { NewsController } from './NewsController';

@Module({
  imports: [ScrapingModule],
  controllers: [NewsController],
  providers: [],
})
export class AppModule {}
