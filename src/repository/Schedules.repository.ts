import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractMongooseRepository } from './AbstractMongoose.repository';
import { Schedule } from 'src/schemas/schedules.schema';

@Injectable()
export class SchedulesRepository extends AbstractMongooseRepository<Schedule> {
  constructor(
    @InjectModel(Schedule.name)
    model: Model<any>,
  ) {
    super(model);
  }
}
