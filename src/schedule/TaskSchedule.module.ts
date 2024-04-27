import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from 'src/config/configuration';
import { JobsModule } from 'src/jobs/Jobs.module';
import { SchedulesRepository } from 'src/repository/Schedules.repository';
import { Schedule, SchedulesSchema } from 'src/schemas/schedules.schema';
import { DynamicScheduleService } from './DynamicSchedule.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    JobsModule,
    MongooseModule.forFeature([
      { name: Schedule.name, schema: SchedulesSchema },
    ]),
  ],
  controllers: [],
  providers: [SchedulesRepository, DynamicScheduleService],
  exports: [SchedulesRepository, DynamicScheduleService],
})
export class TaskScheduleModule {}
