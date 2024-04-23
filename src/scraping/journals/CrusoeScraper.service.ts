import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { Article } from 'src/interface/Article';
import { Page } from 'puppeteer';

@Injectable()
export class CrusoeScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://crusoe.com.br/#ultimas';
  }

  protected async evaluate(page: Page, sufix = ''): Promise<Article[]> {
    const items = await page.evaluate(
      async () => {
        const articles = [];
        const elements = document.querySelectorAll('.post.hasimg');
        if (!elements.length) return [];

        for (const e of elements as unknown as any[]) {
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

          const link = e.querySelector('.link-internal123')
            ? e.querySelector('.link-internal123').getAttribute('href')
            : '';

          const titleStr = link
            .replace(`https://crusoe.com.br/diario/`, '')
            .split('-')
            .join(' ');
          const title =
            titleStr.charAt(0).toUpperCase() +
            titleStr.slice(1, -1).toLowerCase();

          articles.push({
            journalId: e.getAttribute('id'),
            title:
              e.querySelector('.title h2') &&
              e.querySelector('.title h2').innerText
                ? e.querySelector('.title h2').innerText
                : title,
            category: 'politica',
            author: e.querySelector('.creator .autor')
              ? e.querySelector('.creator .autor').innerText
              : '',
            link,
            company: 'Revista Crusoé',
            resume: e.querySelector('p') ? e.querySelector('p').innerText : '',
            date: e.querySelector('.creator .data')
              ? parseISO(e.querySelector('.creator .data').innerText)
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
