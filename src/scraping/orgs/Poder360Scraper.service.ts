import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { Article } from 'src/interface/Article';
import { CheerioAPI } from 'cheerio';

@Injectable()
export class Poder360ScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://www.poder360.com.br/poder-hoje';
    this.companyName = 'poder360';
    this.elementsSelector = '.archive-list__list li';
  }

  private parseISO(time: string, element): string {
    const meses = {
      jan: '01',
      fev: '02',
      mar: '03',
      abr: '04',
      mai: '05',
      jun: '06',
      jul: '07',
      ago: '08',
      set: '09',
      out: '10',
      nov: '11',
      dez: '12',
    };

    const dateString = this.getDateFromLi(element);
    if (!dateString) return '';
    const timeStr = time.replace(' - ', '').replace('h', ':').trim();

    const [dia, mesAbrev, ano] = dateString.split('.');
    if (dateString.split('.').length < 2) return '';

    const mes = meses[mesAbrev.toLowerCase()];
    const dataISO = `${ano}-${mes}-${dia}T${timeStr}:00`;

    try {
      return new Date(dataISO).toISOString();
    } catch {
      this.logger.warn(`Data inválida: ${dateString}`);
      return '';
    }
  }

  protected extractArticleItem($: CheerioAPI, element): Article | null {
    const link = this.getElementValue(element, 'a', 'href');
    const { title } = this.getTitleLink(link);
    const category = this.getCategory(link);

    if (['esporte', 'generico'].includes(category)) return null;

    const time = this.getElementValue(element, '.archive-list__date');
    const date = this.parseISO(time, element);

    const categoryLink =
      link.split('/').length > 2 ? link.split('/')[3] : category;

    return {
      orgId: this.getOrgId(
        link
          .replace(
            `https://www.poder360.com.br/${categoryLink}/`,
            `${categoryLink}__`,
          )
          .replace('/', ''),
      ),
      title: this.getElementValue(element, 'a', '', title),
      category: category,
      author: '',
      link,
      company: this.companyName,
      resume: '',
      date: date ? date : new Date().toISOString(),
    };
  }

  private getCategory(link): string {
    const tag = link.split('/').length > 2 ? link.split('/')[3] : '';
    switch (tag.toLowerCase()) {
      case 'economia':
        return 'economia';
      case 'esportes':
        return 'esporte';
      case 'poder-empreendedor':
      case 'visitas-ao-poder360':
      case 'poder-tech':
      case 'poder-flash':
      case 'brasil':
      case 'saude':
      case 'educacao':
      case 'energia':
        return 'generico';
      default:
        return 'politica';
    }
  }

  private getDateFromLi(element) {
    const prevElements = element.prevAll('strong.archive-list__subhead');
    if (!prevElements.length) return null;
    return prevElements.first().text();
  }
}
