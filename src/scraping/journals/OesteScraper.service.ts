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
    this.elementsSelector = 'article.card-post--grid, article.card-post--list';
  }

  protected async evaluate(page: Page, sufix = ''): Promise<CheerioAPI> {
    await page.waitForSelector(
      'article.card-post--list, article.card-post--grid',
      {
        visible: true,
        timeout: 5000,
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

  protected extractArticleItem(
    $: CheerioAPI,
    element,
    sufix?: string,
  ): Article {
    const link = this.getElementValue(element, '.card-post__title', 'href');

    const { title } = this.getTitleLink(
      link.replace(`${this.url}/${sufix}/`, ''),
    );

    return {
      journalId: this.getJournalId(
        link.replace(`${this.url}/${sufix}/`, `${sufix}__`),
      ),
      title: this.getElementValue(element, 'h2', '', title),
      category: sufix,
      author: this.getElementValue(
        element,
        '.text-gray-500.text-xs.mt-auto a',
        '',
      ),
      link,
      company: this.companyName,
      resume: this.getElementValue(element, 'p.text-base', ''),
      date: this.getElementValue(element, 'time', 'datetime'),
    };
  }
}
