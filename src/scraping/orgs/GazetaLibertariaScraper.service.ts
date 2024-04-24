import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { Article } from 'src/interface/Article';
import { CheerioAPI } from 'cheerio';

@Injectable()
export class GazetaLibertariaScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://gazetalibertaria.news/?s=';
    this.companyName = 'gazeta_libertaria';
    this.elementsSelector = '.post';
  }

  private parseISO(dataString: string): string {
    const partes = dataString.split(/[/ :]/);
    if (partes.length < 5) return;

    const dataFormatada = `${partes[1]}/${partes[0]}/${partes[2]} ${partes[3]}:${partes[4]}`;
    try {
      const data = new Date(dataFormatada);
      return data.toISOString();
    } catch {
      this.logger.warn(`Data inválida: ${dataString}`);
      return '';
    }
  }

  protected extractArticleItem($: CheerioAPI, element): Article | null {
    const link = this.getElementValue(element, '.entry-title a', 'href');

    const { title } = this.getTitleLink(
      link.replace('https://gazetalibertaria.news/', ''),
    );
    const categoryText = this.getElementValue(element, '.cat-links a');
    const category = this.getCategory(categoryText);

    const date = this.getElementValue(
      element,
      '.entry-date.published',
      'datetime',
    );

    return {
      orgId: element.prop('id'),
      title: this.getElementValue(element, '.post-title', '', title),
      category: category,
      author: this.getElementValue(element, '.author.vcard a'),
      link,
      company: this.companyName,
      resume: this.getElementValue(element, '.entry-summary p'),
      date: date ? date : new Date().toISOString(),
    };
  }

  private getCategory(text): string {
    switch (text.toLowerCase()) {
      case 'mundo':
      case 'brasil':
      case 'direito':
        return 'politica';
      case 'economia':
      case 'criptomoedas':
        return 'economia';
      case 'ética':
        return 'etica';
      case 'esportes':
        return 'esporte';
      default:
        return 'politica';
    }
  }
}
