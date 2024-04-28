import { AbstractService } from '@devseeder/typescript-commons';

export abstract class AbstractAnalyzeNewsService extends AbstractService {
  constructor() {
    super();
  }

  protected parseResponseToJSON<GptResponse>(content: string): GptResponse[] {
    try {
      const str = content.replaceAll('`', '').replaceAll('json', '').trim();
      return JSON.parse(str) as GptResponse[];
    } catch (err) {
      this.logger.error(`Erro ao fazer parse da resposta: ${err}`);
      this.logger.error(`Conteúdo com erro: ${content}`);
      return [];
    }
  }
}
