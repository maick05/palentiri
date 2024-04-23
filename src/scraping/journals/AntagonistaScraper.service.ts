import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { Article } from 'src/interface/Article';
import { Page } from 'puppeteer';

@Injectable()
export class AntagonistaScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://oantagonista.com.br';
  }

  protected async evaluate(page: Page, sufix = ''): Promise<Article[]> {
    const highLight = await this.evaluateHighLight(page, sufix);
    const twoCol = await this.evaluateTwoCol(page, sufix);

    return [...highLight, ...twoCol];
  }

  private async evaluateHighLight(page: Page, sufix = ''): Promise<Article[]> {
    await page.waitForSelector(`.${sufix}-area__highlight .row .col`, {
      visible: true,
      timeout: 3000,
    });

    const items = await page.evaluate(
      async (params) => {
        const parseISO = (dataString) => {
          const partes = dataString.split(' ');

          const dataPartes = partes[0].split('.');
          const dia = dataPartes[0];
          const mes = dataPartes[1] - 1; // Ajusta o mês para a indexação base-0 do JavaScript
          const ano = dataPartes[2];

          const horaPartes = partes[1].split(':');
          const horas = horaPartes[0];
          const minutos = horaPartes[1];

          const data = new Date(ano, mes, dia, horas, minutos);

          return data.toISOString();
        };

        const getCategory = (tagText, link, sufix) => {
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
        };

        const articles = [];
        const elements = document.querySelectorAll(
          `.${params.sufix}-area__highlight .row .col`,
        );
        if (!elements.length) return [];

        for (const e of elements as unknown as any[]) {
          const parent = e.parentElement.parentElement;
          const link = parent.querySelector(`.${params.sufix}-area__link`)
            ? parent
                .querySelector(`.${params.sufix}-area__link`)
                .getAttribute('href')
            : '';

          const categoryText = e.querySelector(
            `.${params.sufix}-area__category`,
          )
            ? e.querySelector(`.${params.sufix}-area__category`).innerText
            : '';

          const category = getCategory(categoryText, link, params.sufix);

          if (category == 'esporte') {
            console.log(`[Log WebScraping] Ignorando categoria ${category}`);
            continue;
          }

          const titleStr = link
            .replace(`${params.url}/`, '')
            .split('-')
            .join(' ');
          const title =
            titleStr.charAt(0).toUpperCase() +
            titleStr.slice(1, -1).toLowerCase();

          articles.push({
            journalId: link
              .replace(`${params.url}/`, '')
              .replace(`${link.split('/')[3]}/`, `${link.split('/')[3]}__`)
              .replaceAll('-', '_')
              .replace('/', ''),
            title:
              e.querySelector(`.${params.sufix}-area__title-h3`) &&
              e.querySelector(`.${params.sufix}-area__title-h3`).innerText
                ? e.querySelector(`.${params.sufix}-area__title-h3`).innerText
                : title,
            category,
            author: '',
            link,
            company: 'O Antagonista',
            resume: e.querySelector('p') ? e.querySelector('p').innerText : '',
            date: e.querySelectorAll(
              `.${params.sufix}-area__date.${params.sufix}-area__date--desktop span`,
            ).length
              ? parseISO(
                  e.querySelectorAll(
                    `.${params.sufix}-area__date.${params.sufix}-area__date--desktop span`,
                  )[0].innerText,
                )
              : '',
          });
        }
        return articles;
      },
      { url: this.url, sufix },
    );
    return items;
  }

  private async evaluateTwoCol(page: Page, sufix = ''): Promise<Article[]> {
    const items = await page.evaluate(
      async (params) => {
        const parseISO = (dataString) => {
          const partes = dataString.split(' ');

          const dataPartes = partes[0].split('.');
          const dia = dataPartes[0];
          const mes = dataPartes[1] - 1; // Ajusta o mês para a indexação base-0 do JavaScript
          const ano = dataPartes[2];

          const horaPartes = partes[1].split(':');
          const horas = horaPartes[0];
          const minutos = horaPartes[1];

          const data = new Date(ano, mes, dia, horas, minutos);

          return data.toISOString();
        };

        const getCategory = (tagText, link, sufix) => {
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
        };

        const articles = [];
        const elements = document.querySelectorAll(
          `.${params.sufix}-area__two-col .row .col`,
        );
        if (!elements.length) return [];

        for (const e of elements as unknown as any[]) {
          const link = e.querySelector(`.${params.sufix}-area__link`)
            ? e
                .querySelector(`.${params.sufix}-area__link`)
                .getAttribute('href')
            : '';

          if (!link.length) continue;

          const categoryText = e.querySelector(
            `.${params.sufix}-area__category`,
          )
            ? e.querySelector(`.${params.sufix}-area__category`).innerText
            : '';

          const category = getCategory(categoryText, link, params.sufix);
          if (category == 'esporte') {
            console.log(`[Log WebScraping] Ignorando categoria ${category}`);
            continue;
          }

          const titleStr = link
            .replace(`${params.url}/`, '')
            .split('-')
            .join(' ');
          const title =
            titleStr.charAt(0).toUpperCase() +
            titleStr.slice(1, -1).toLowerCase();

          articles.push({
            journalId: link
              .replace(`${params.url}/`, '')
              .replace(`${link.split('/')[3]}/`, `${link.split('/')[3]}__`)
              .replaceAll('-', '_')
              .replace('/', ''),
            title:
              e.querySelector(`.${params.sufix}-area__title-h3`) &&
              e.querySelector(`.${params.sufix}-area__title-h3`).innerText
                ? e.querySelector(`.${params.sufix}-area__title-h3`).innerText
                : title,
            category,
            author: '',
            link,
            company: 'O Antagonista',
            resume: e.querySelector('p') ? e.querySelector('p').innerText : '',
            date: e.querySelector('.date-time__date')
              ? parseISO(e.querySelector('.date-time__date').innerText)
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
