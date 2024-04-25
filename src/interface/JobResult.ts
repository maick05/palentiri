export type JobResult = ScrapeNewsListResult;

export interface JobDataResult<JobData> {
  data: JobData;
  result: JobResult;
}

export interface JobResponse {
  jobId: string;
  success: boolean;
  jobResult?: JobDataResult<any>;
  error?: any;
}

export interface ScrapeNewsListResult {
  collectedNews: number;
}
