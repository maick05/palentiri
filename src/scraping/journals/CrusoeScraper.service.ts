import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { Article } from 'src/interface/Article';
import { Page } from 'puppeteer';
import { CheerioAPI } from 'cheerio';

@Injectable()
export class CrusoeScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://crusoe.com.br/#ultimas';
    this.companyName = 'Revista Crusoé';
  }

  private parseIso(dataString: string): string {
    const partes = dataString.split(' ');

    const dataPartes = partes[0].split('.');

    if (dataPartes.length < 3) return '';

    const dia = Number(dataPartes[0]);
    const mes = Number(dataPartes[1]) - 1;
    const ano = Number(dataPartes[2]);

    const horaPartes = partes[1].split(':');
    const horas = Number(horaPartes[0]);
    const minutos = Number(horaPartes[1]);

    const data = new Date(ano, mes, dia, horas, minutos);

    return data.toISOString();
  }

  protected async extractItems(page: Page, $: CheerioAPI): Promise<Article[]> {
    const articles = [];
    const elements = $('.post.hasimg');
    if (!elements.length) return [];
    let i = 0;
    for await (const e of elements.get()) {
      const element = elements.eq(i);
      i++;
      const link = await this.getElementValue(
        element,
        '.link-internal123',
        'href',
      );

      const { title } = this.getTitleLink(
        link.replace(`https://crusoe.com.br/diario/`, ''),
      );

      const date = await this.getElementValue(element, '.creator .data');

      articles.push({
        journalId: element.prop('id'),
        title: await this.getElementValue(element, '.title h2', '', title),
        category: 'politica',
        author: await this.getElementValue(element, '.creator .autor'),
        link,
        company: this.companyName,
        resume: await this.getElementValue(element, 'p', ''),
        date: date ? this.parseIso(date) : '',
      });
    }
    return articles;
  }
}
