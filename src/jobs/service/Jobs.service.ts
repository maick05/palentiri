import { AbstractService, DateHelper } from '@devseeder/typescript-commons';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JobParams } from 'src/interface/JobParams';
import { ScrapeNewsJobService } from './ScrapeNewsJob.service';
import { JobKeyEnum } from 'src/enum/JobKeyEnum';
import { Job } from 'src/schemas/jobs.schema';
import { JobsRepository } from 'src/repository/Jobs.repository';
import { JobDataResult, JobResponse, JobResult } from 'src/interface/JobResult';
import { AnalyzeCategoryNewsJobService } from './AnalyzeCategoryNewsJob.service';

@Injectable()
export class JobsService extends AbstractService {
  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly scrapeNewsJobService: ScrapeNewsJobService,
    private readonly analyzeCategoryNewsJobService: AnalyzeCategoryNewsJobService,
  ) {
    super();
  }

  async startJob(job: string, jobParams?: JobParams): Promise<JobResponse> {
    const jobId = await this.createDatabaseJob(job, jobParams);
    try {
      this.logger.log(`Starting job '${job}'...`);
      const jobResult = await this.executeJob(job, jobId, jobParams);
      await this.finishJobSuccess(jobId, jobResult.result);
      this.logger.log(`Job Finished`);
      return { jobId, success: true, jobResult };
    } catch (err) {
      await this.finishJobError(jobId, err);
      return { jobId, success: false, error: err };
    }
  }

  private async createDatabaseJob(
    job: string,
    jobParams: JobParams,
  ): Promise<string> {
    try {
      const jobEntity = new Job();
      jobEntity.jobKey = job;
      jobEntity.startDate = DateHelper.getDateNow();
      jobEntity.finished = false;
      jobEntity.inputParams = jobParams;
      jobEntity.active = true;

      this.logger.log(`Creating database job... ${JSON.stringify(jobEntity)}`);

      const jobId = await this.jobsRepository.create(jobEntity);
      return jobId['_id'].toString();
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        `Error creating database job: ${JSON.stringify(err)}`,
      );
    }
  }

  private async finishJobSuccess(
    jobId: string,
    jobResult: JobResult,
  ): Promise<void> {
    this.logger.log(`Finishing job '${jobId}' on database...`);
    await this.jobsRepository.updateOneById(jobId, {
      endDate: DateHelper.getDateNow(),
      finished: true,
      jobResult: jobResult,
      success: true,
    });
    this.logger.log(`Job '${jobId}' Updated.`);
  }

  private async finishJobError(jobId: string, error: any): Promise<void> {
    this.logger.log(`Finishing job[Error] '${jobId}' on database...`);
    await this.jobsRepository.updateOneById(jobId, {
      endDate: DateHelper.getDateNow(),
      finished: true,
      success: false,
      error,
    });
    this.logger.log(`Job '${jobId}' Updated.`);
  }

  private async executeJob(
    job: string,
    jobId: string,
    jobParams?: JobParams,
  ): Promise<JobDataResult<any>> {
    try {
      let jobResult;
      switch (job) {
        case JobKeyEnum.SCRAPE_NEWS_LIST:
          jobResult = await this.scrapeNewsJobService.execute(
            jobParams.publisher,
            jobId,
            jobParams.sufix,
          );
          break;
        case JobKeyEnum.ANALYZE_NEWS:
          jobResult = await this.analyzeCategoryNewsJobService.execute();
          break;
        default:
          throw new BadRequestException('Invalid Job');
      }
      return jobResult;
    } catch (err) {
      this.logger.error(err);
    }
  }
}
