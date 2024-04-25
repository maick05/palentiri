import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'src/schemas/jobs.schema';
import { AbstractMongooseRepository } from './AbstractMongoose.repository';

@Injectable()
export class JobsRepository extends AbstractMongooseRepository<Job> {
  constructor(
    @InjectModel(Job.name)
    model: Model<any>,
  ) {
    super(model);
  }
}
