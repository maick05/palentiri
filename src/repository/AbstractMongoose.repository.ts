import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientSession, Model } from 'mongoose';
import { MongooseRepository } from '@devseeder/typescript-commons';

@Injectable()
export abstract class AbstractMongooseRepository<
  Entity,
> extends MongooseRepository<Entity, Entity & Document> {
  constructor(model: Model<Entity & Document>) {
    super(model);
  }

  async create(
    document: Entity,
    session: ClientSession = null,
  ): Promise<Entity & Document> {
    try {
      const options = session ? { session: session } : {};
      const savedDoc = await this.model.create([document], options);
      return savedDoc[0];
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
