import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { JobsService } from 'src/jobs/service/Jobs.service';
import { CronJob } from 'cron';
import { SchedulesRepository } from 'src/repository/Schedules.repository';
import { Schedule } from 'src/schemas/schedules.schema';
import { AbstractService } from '@devseeder/typescript-commons';

@Injectable()
export class DynamicScheduleService extends AbstractService {
  constructor(
    private schedulesRepository: SchedulesRepository,
    private schedulerRegistry: SchedulerRegistry,
    private jobsService: JobsService,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.startCronsJob();
  }

  async startCronsJob(): Promise<void> {
    const schedules = await this.schedulesRepository.find({ active: true });
    this.logger.log(`Schedules Found: ${schedules.length}.`);
    for await (const schedule of schedules) {
      await this.addCronJob(schedule);
    }
    this.logger.log('Task Scheduler finished.');
  }

  private async addCronJob(schedule: Schedule) {
    this.logger.log(`CronJob --> '${schedule.name}'`);
    this.logger.log(`Expression --> '${schedule.expression}'`);

    const job = new CronJob(schedule.expression, async () => {
      this.logger.log(`CronJob --> '${schedule.name}'`);
      this.logger.log(`Task Input => ${JSON.stringify(schedule.inputParams)}`);
      await this.jobsService.startJob(schedule.jobKey, schedule.inputParams);
      this.logger.log('Task Finished.');
    });

    this.schedulerRegistry.addCronJob(schedule.name, job);
    job.start();
  }
}
