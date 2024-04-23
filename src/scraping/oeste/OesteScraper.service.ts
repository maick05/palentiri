import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { Article } from 'src/interface/Article';
import { Page } from 'puppeteer';

@Injectable()
export class OesteScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://revistaoeste.com';
    this.validSufixes = ['politica', 'economia'];
  }

  protected async evaluate(page: Page, sufix = ''): Promise<Article[]> {
    await page.waitForSelector(
      'article.card-post--list, article.card-post--grid',
      {
        visible: true,
        timeout: 1000,
      },
    );

    const items = await page.evaluate(
      async (params) => {
        const articles = [];
        const elements = document.querySelectorAll(
          'article.card-post--grid, article.card-post--list',
        );
        await elements[elements.length - 1]
          .querySelector('.card-post__title')
          .scrollIntoView();

        if (!elements.length) return [];

        for (const e of elements as unknown as any[]) {
          const link = e.querySelector('.card-post__title')
            ? e.querySelector('.card-post__title').getAttribute('href')
            : '';

          const titleStr = link
            .replace(`${params.url}/${params.sufix}/`, '')
            .split('-')
            .join(' ');
          const title =
            titleStr.charAt(0).toUpperCase() +
            titleStr.slice(1, -1).toLowerCase();

          articles.push({
            journalId: link
              .replace(`${params.url}/${params.sufix}/`, `${params.sufix}__`)
              .split('-')
              .join('_')
              .replace('/', ''),
            title:
              e.querySelector('h2') && e.querySelector('h2').innerText
                ? e.querySelector('h2').innerText
                : title,
            category: params.sufix,
            author: e.querySelector('.text-gray-500.text-xs.mt-auto a')
              ? e.querySelector('.text-gray-500.text-xs.mt-auto a').innerText
              : '',
            link,
            company: 'Revista Oeste',
            resume: e.querySelector('p.text-base')
              ? e.querySelector('p.text-base').innerText
              : '',
            date: e.querySelector('time')
              ? e.querySelector('time').getAttribute('datetime')
              : '',
          });
        }
        return articles;
      },
      { url: this.url, sufix },
    );
    return items;
  }
}
