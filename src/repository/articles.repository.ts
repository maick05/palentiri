import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from 'src/schemas/articles.schema';
import { AbstractMongooseRepository } from './AbstractMongoose.repository';

@Injectable()
export class ArticlesRepository extends AbstractMongooseRepository<Article> {
  constructor(
    @InjectModel(Article.name)
    model: Model<any>,
  ) {
    super(model);
  }
}
