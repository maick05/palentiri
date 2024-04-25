/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { ArticleDto } from 'src/interface/Article';
import { Page } from 'puppeteer';
import { CheerioAPI } from 'cheerio';
import { DateHelper } from '@devseeder/typescript-commons';

@Injectable()
export class AntagonistaScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://oantagonista.com.br';
    this.publisher = 'antagonista';
    this.validSufixes = ['ultimas-noticias', 'economia', 'mundo', 'brasil'];
  }

  protected async evaluate(page: Page, sufix = ''): Promise<CheerioAPI> {
    await page.waitForSelector(`.ultimas-noticias-area__highlight .row .col`, {
      visible: true,
      timeout: 15000,
    });

    return super.evaluate(page, sufix);
  }

  protected extractItems($: CheerioAPI, sufix = ''): ArticleDto[] {
    const fixedSufix = 'ultimas-noticias';
    const highLight = this.extractHighlight($, fixedSufix);
    const twoCol = this.extractBySection(
      $,
      fixedSufix,
      'area__two-col .row .col',
      'TwoCol',
    );
    const rightHighLight = this.extractBySection(
      $,
      fixedSufix,
      'area__item-highlight',
      'HighLight',
    );
    const areaItem = this.extractBySection(
      $,
      fixedSufix,
      'area__item-',
      'AreaItem',
    );
    const areaItemLarge = this.extractBySection(
      $,
      fixedSufix,
      'area__item-large',
      'AreaItemLarge',
    );

    const mostRead = this.extractBySection(
      $,
      fixedSufix,
      'area__item-most-read',
      'MostRead',
    );

    const areaItemText = this.extractBySection(
      $,
      fixedSufix,
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

  protected extractHighlight($: CheerioAPI, sufix): ArticleDto[] {
    const articles = [];
    const elements = $(`.${sufix}-area__highlight .row .col`);
    if (!elements.length) return [];
    let i = 0;
    for (const e of elements.get()) {
      const element = elements.eq(i);
      i++;

      const parent = element.parent().parent();
      const link = this.getElementValue(parent, `.${sufix}-area__link`, 'href');

      const categoryText = this.getElementValue(
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
        : DateHelper.getDateNow().toISOString();

      const titleItem = this.getElementValue(
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
        orgId: this.getOrgId(link),
        title: titleItem,
        category,
        author: '',
        link,
        publisher: this.publisher,
        resume: this.getElementValue(element, 'p', ''),
        date,
      });
    }
    return articles;
  }

  protected extractBySection(
    $: CheerioAPI,
    sufix: string,
    selector: string,
    logIdentif: string,
  ): ArticleDto[] {
    const articles = [];
    const elements = $(`.${sufix}-${selector}`);
    if (!elements.length) return [];
    elements.each((i, e) => {
      const element = $(e);

      const link = this.getElementValue(
        element,
        `.${sufix}-area__link`,
        'href',
      );

      if (!link.length) return;

      const categoryText = this.getElementValue(
        element,
        `.${sufix}-area__category`,
      );

      const category = this.getCategory(categoryText, link, sufix);

      const { title } = this.getTitleLink(link.replace(`${this.url}/`, ''));

      if (category == 'esporte') {
        this.logger.warn(
          `[Log WebScraping][${logIdentif}] Ignorando categoria ${category}: ${title}`,
        );
        return;
      }

      const date = this.getElementValue(element, '.date-time__date');
      const titleItem = this.getElementValue(
        element,
        `.${sufix}-area__title-h3`,
        '',
        title,
      );

      if (titleItem.startsWith('Crusoé: ')) {
        this.logger.warn(
          `[Log WebScraping][${logIdentif}] Ignorando Notícia Crusoé ${titleItem}`,
        );
        return;
      }

      articles.push({
        orgId: this.getOrgId(link),
        title: titleItem,
        category,
        author: this.getElementValue(element, `.${sufix}-area__author`),
        link,
        publisher: this.publisher,
        resume: this.getElementValue(element, 'p', ''),
        date: date
          ? this.parseISO(date)
          : DateHelper.getDateNow().toISOString(),
      });
    });
    return articles;
  }

  private parseISO(dataString: string): string {
    const partes = dataString.trim().split(' ');

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

  protected getOrgId(link: string): string {
    if (link.split('/').length < 4) return link;
    return link
      .replace(`${this.url}/`, '')
      .replace(`${link.split('/')[3]}/`, `${link.split('/')[3]}__`)
      .replace('-', '_')
      .replace('/', '');
  }

  protected extractArticleItem(
    $: CheerioAPI,
    element: any,
    sufix?: string,
  ): ArticleDto {
    throw new Error('Method not implemented.');
  }
}
