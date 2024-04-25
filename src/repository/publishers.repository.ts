import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publisher } from 'src/schemas/publishers.schema';
import { AbstractMongooseRepository } from './AbstractMongoose.repository';

@Injectable()
export class PublishersRepository extends AbstractMongooseRepository<Publisher> {
  constructor(
    @InjectModel(Publisher.name)
    model: Model<any>,
  ) {
    super(model);
  }
}
