import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/Jobs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TaskScheduleModule } from './schedule/TaskSchedule.module';

@Module({
  imports: [
    TaskScheduleModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('database.mongodb.connection'),
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    JobsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
