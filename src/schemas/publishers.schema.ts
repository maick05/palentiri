/* eslint-disable @typescript-eslint/no-unused-vars */
import { AbstractSchema } from '@devseeder/typescript-commons/dist/schema/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PublisherDocument = Publisher & Document;

@Schema({ timestamps: true, collection: 'publishers' })
export class Publisher extends AbstractSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: false, default: [] })
  mainCategories: string[];

  @Prop({ required: true })
  url: string;

  @Prop({ required: false, default: [] })
  validSufixes: string[];

  @Prop({ required: true })
  jobActive: boolean;

  @Prop({ required: true })
  service: string;
}

const schema = SchemaFactory.createForClass(Publisher);
schema.index({ key: 1, active: 1 }, { unique: true });
export const PublisherSchema = schema;
