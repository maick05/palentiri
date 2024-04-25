import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { ArticleDto } from 'src/interface/Article';
import { CheerioAPI } from 'cheerio';
import { DateHelper } from '@devseeder/typescript-commons';

@Injectable()
export class CrusoeScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://crusoe.com.br/#ultimas';
    this.publisher = 'revista_crusoe';
    this.elementsSelector = '.post.hasimg';
  }

  private parseIso(dataString: string): string {
    const partes = dataString.split(' ');

    if (partes.length < 2) return '';

    const dataPartes = partes[0].split('.');

    if (dataPartes.length < 3) return '';

    const dia = Number(dataPartes[0]);
    const mes = Number(dataPartes[1]) - 1;
    const ano = Number(dataPartes[2]);

    const horaPartes = partes[1].split(':');
    const horas = Number(horaPartes[0]);
    const minutos = Number(horaPartes[1]);
    try {
      const data = new Date(ano, mes, dia, horas, minutos);

      return data.toISOString();
    } catch {
      this.logger.warn(`Data inválida: ${dataString}`);
      return '';
    }
  }

  protected extractArticleItem($: CheerioAPI, element): ArticleDto {
    const link = this.getElementValue(element, '.link-internal123', 'href');

    const { title } = this.getTitleLink(
      link.replace(`https://crusoe.com.br/diario/`, ''),
    );

    const date = this.getElementValue(element, '.creator .data');
    return {
      orgId: element.prop('id'),
      title: this.getElementValue(element, '.title h2', '', title),
      category: 'politica',
      author: this.getElementValue(element, '.creator .autor'),
      link,
      publisher: this.publisher,
      resume: this.getElementValue(element, 'p', ''),
      date: date ? this.parseIso(date) : DateHelper.getDateNow().toISOString(),
    };
  }
}
