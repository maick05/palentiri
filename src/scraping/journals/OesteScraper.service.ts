import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { Article } from 'src/interface/Article';
import { Page } from 'puppeteer';
import { CheerioAPI } from 'cheerio';

@Injectable()
export class OesteScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://revistaoeste.com';
    this.validSufixes = ['politica', 'economia'];
    this.companyName = 'Revista Oeste';
  }

  protected async evaluate(page: Page, sufix = ''): Promise<CheerioAPI> {
    await page.waitForSelector(
      'article.card-post--list, article.card-post--grid',
      {
        visible: true,
        timeout: 1000,
      },
    );

    await page.evaluate(async () => {
      const elements = document.querySelectorAll(
        'article.card-post--grid, article.card-post--list',
      );
      await elements[elements.length - 1]
        .querySelector('.card-post__title')
        .scrollIntoView();
    });

    return super.evaluate(page, sufix);
  }

  protected async extractItems(
    page: Page,
    $: CheerioAPI,
    sufix?: string,
  ): Promise<Article[]> {
    const articles = [];
    const elements = $('article.card-post--grid, article.card-post--list');
    if (!elements.length) return [];
    let i = 0;
    for await (const e of elements.get()) {
      const element = elements.eq(i);
      i++;
      const link = await this.getElementValue(
        element,
        '.card-post__title',
        'href',
      );

      const { title } = this.getTitleLink(
        link.replace(`${this.url}/${sufix}/`, ''),
      );

      articles.push({
        journalId: link
          .replace(`${this.url}/${sufix}/`, `${sufix}__`)
          .split('-')
          .join('_')
          .replace('/', ''),
        title: await this.getElementValue(element, 'h2', '', title),
        category: sufix,
        author: await this.getElementValue(
          element,
          '.text-gray-500.text-xs.mt-auto a',
          '',
        ),
        link,
        company: this.companyName,
        resume: await this.getElementValue(element, 'p.text-base', ''),
        date: await this.getElementValue(element, 'time', 'datetime'),
      });
    }
    return articles;
  }
}
