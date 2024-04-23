import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { Article } from 'src/interface/Article';
import { Page } from 'puppeteer';
import { CheerioAPI } from 'cheerio';

@Injectable()
export class AntagonistaScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://oantagonista.com.br';
    this.companyName = 'O Antagonista';
  }

  protected async evaluate(page: Page, sufix = ''): Promise<CheerioAPI> {
    await page.waitForSelector(`.${sufix}-area__highlight .row .col`, {
      visible: true,
      timeout: 15000,
    });

    return super.evaluate(page, sufix);
  }

  protected async extractItems($: CheerioAPI, sufix = ''): Promise<Article[]> {
    const highLight = await this.extractHighlight($, sufix);
    const twoCol = await this.extractBySection(
      $,
      sufix,
      'area__two-col .row .col',
      'TwoCol',
    );
    const rightHighLight = await this.extractBySection(
      $,
      sufix,
      'area__item-highlight',
      'HighLight',
    );
    const areaItem = await this.extractBySection(
      $,
      sufix,
      'area__item-',
      'AreaItem',
    );
    const areaItemLarge = await this.extractBySection(
      $,
      sufix,
      'area__item-large',
      'AreaItemLarge',
    );

    const mostRead = await this.extractBySection(
      $,
      sufix,
      'area__item-most-read',
      'MostRead',
    );

    const areaItemText = await this.extractBySection(
      $,
      sufix,
      'area__item-text',
      'AreaItemText',
    );

    return [
      ...highLight,
      ...twoCol,
      ...rightHighLight,
      ...areaItem,
      ...areaItemLarge,
      ...mostRead,
      ...areaItemText,
    ];
  }

  protected async extractHighlight($: CheerioAPI, sufix): Promise<Article[]> {
    const articles = [];
    const elements = $(`.${sufix}-area__highlight .row .col`);
    if (!elements.length) return [];
    let i = 0;
    for await (const e of elements.get()) {
      const element = elements.eq(i);
      i++;

      const parent = element.parent().parent();
      const link = await this.getElementValue(
        parent,
        `.${sufix}-area__link`,
        'href',
      );

      const categoryText = await this.getElementValue(
        element,
        `.${sufix}-area__category`,
      );

      const category = this.getCategory(categoryText, link, sufix);

      if (category == 'esporte') {
        this.logger.warn(
          `[Log WebScraping][Highlight] Ignorando categoria ${category}`,
        );
        continue;
      }

      const { title } = this.getTitleLink(link.replace(`${this.url}/`, ''));

      const date = $(`.${sufix}-area__date.${sufix}-area__date--desktop span`)
        .length
        ? this.parseISO(
            $(`.${sufix}-area__date.${sufix}-area__date--desktop span`)
              .eq(0)
              .text(),
          )
        : '';

      const titleItem = await this.getElementValue(
        element,
        `.${sufix}-area__title-h3`,
        '',
        title,
      );

      if (titleItem.startsWith('Crusoé: ')) {
        this.logger.warn(
          `[Log WebScraping][Highlight] Ignorando Notícia Crusoé ${titleItem}`,
        );
        continue;
      }

      articles.push({
        journalId: this.getJournalId(link),
        title: titleItem,
        category,
        author: '',
        link,
        company: this.companyName,
        resume: await this.getElementValue(element, 'p', ''),
        date,
      });
    }
    return articles;
  }

  protected async extractBySection(
    $: CheerioAPI,
    sufix: string,
    selector: string,
    logIdentif: string,
  ): Promise<Article[]> {
    const articles = [];
    const elements = $(`.${sufix}-${selector}`);
    if (!elements.length) return [];
    let i = 0;
    for await (const e of elements.get()) {
      const element = elements.eq(i);
      i++;

      const link = await this.getElementValue(
        element,
        `.${sufix}-area__link`,
        'href',
      );

      if (!link.length) continue;

      const categoryText = await this.getElementValue(
        element,
        `.${sufix}-area__category`,
      );

      const category = this.getCategory(categoryText, link, sufix);

      const { title } = this.getTitleLink(link.replace(`${this.url}/`, ''));

      if (category == 'esporte') {
        this.logger.warn(
          `[Log WebScraping][${logIdentif}] Ignorando categoria ${category}: ${title}`,
        );
        continue;
      }

      const date = await this.getElementValue(element, '.date-time__date');
      const titleItem = await this.getElementValue(
        element,
        `.${sufix}-area__title-h3`,
        '',
        title,
      );

      if (titleItem.startsWith('Crusoé: ')) {
        this.logger.warn(
          `[Log WebScraping][${logIdentif}] Ignorando Notícia Crusoé ${titleItem}`,
        );
        continue;
      }

      articles.push({
        journalId: this.getJournalId(link),
        title: titleItem,
        category,
        author: await this.getElementValue(element, `.${sufix}-area__author`),
        link,
        company: this.companyName,
        resume: await this.getElementValue(element, 'p', ''),
        date: date ? this.parseISO(date) : '',
      });
    }
    return articles;
  }

  private parseISO(dataString: string): string {
    const partes = dataString.trim().split(' ');
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

  private getCategory(tagText, link, sufix): string {
    if (sufix == 'economia') return 'economia';
    const tagTrim = tagText.trim().replace(' ', '').replace('/n', '');
    const tag = link.split('/').length > 3 ? link.split('/')[3] : tagTrim;

    switch (tag.toLowerCase()) {
      case 'mundo':
      case 'brasil':
        return 'politica';
      case 'economia':
        return 'economia';
      case 'esportes':
        return 'esporte';
      default:
        return 'politica';
    }
  }

  private getJournalId(link: string): string {
    return link
      .replace(`${this.url}/`, '')
      .replace(`${link.split('/')[3]}/`, `${link.split('/')[3]}__`)
      .replace('-', '_')
      .replace('/', '');
  }
}
