/* eslint-disable @typescript-eslint/no-unused-vars */
import { AbstractSchema } from '@devseeder/typescript-commons/dist/schema/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema({ timestamps: true, collection: 'articles' })
export class Article extends AbstractSchema {
  @Prop({ required: true })
  jobId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  resume: string;

  @Prop({ required: true })
  orgId: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: false })
  author: string;

  @Prop({ required: true })
  newsDate: Date;

  @Prop({ required: true })
  link: string;

  @Prop({ required: true })
  jobDate: Date;

  @Prop({ required: true })
  publisher: string;

  @Prop({ required: false })
  newsId: string;

  @Prop({ required: false, type: Object })
  valid: ValidArticle;

  @Prop({ required: false, default: false })
  grouped: boolean;

  @Prop({ required: false, default: false })
  classified: boolean;

  @Prop({ required: false })
  content?: string;
}

export interface ValidArticle {
  isValid: boolean;
  invalidator?: string;
  invalidationReason?: string;
}

const schema = SchemaFactory.createForClass(Article);
schema.index({ orgId: 1, publisher: 1, active: 1 }, { unique: true });
schema.index({ link: 1, active: 1 }, { unique: true });
export const ArticlesSchema = schema;
