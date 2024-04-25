/* eslint-disable @typescript-eslint/no-unused-vars */
import { AbstractSchema } from '@devseeder/typescript-commons/dist/schema/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { JobResult } from 'src/interface/JobResult';

export type JobDocument = Job & Document;

@Schema({ timestamps: true, collection: 'jobs' })
export class Job extends AbstractSchema {
  @Prop({ required: true })
  jobKey: string;

  @Prop({ required: false, default: {}, type: Object })
  inputParams: object;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: false, default: null })
  endDate: Date;

  @Prop({ required: false })
  success: boolean;

  @Prop({ required: true, default: false })
  finished: boolean;

  @Prop({ required: false, default: {}, type: Object })
  jobResult: JobResult;

  @Prop({ required: false, default: {}, type: Object })
  error: object;
}

const schema = SchemaFactory.createForClass(Job);
export const JobsSchema = schema;
