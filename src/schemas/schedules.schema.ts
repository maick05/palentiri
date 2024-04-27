/* eslint-disable @typescript-eslint/no-unused-vars */
import { AbstractSchema } from '@devseeder/typescript-commons/dist/schema/abstract.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { JobKeyEnum } from 'src/enum/JobKeyEnum';
import { JobParams } from 'src/interface/JobParams';

export type ScheduleDocument = Schedule & Document;

@Schema({ timestamps: true, collection: 'schedules' })
export class Schedule extends AbstractSchema {
  @Prop({ required: true })
  jobKey: JobKeyEnum;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: {}, type: Object })
  inputParams: JobParams;

  @Prop({ required: true })
  expression: string;
}

const schema = SchemaFactory.createForClass(Schedule);
export const SchedulesSchema = schema;
