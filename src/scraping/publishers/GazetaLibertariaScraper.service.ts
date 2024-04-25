import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { ArticleDto } from 'src/interface/Article';
import { CheerioAPI } from 'cheerio';
import { DateHelper } from '@devseeder/typescript-commons';

@Injectable()
export class GazetaLibertariaScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://gazetalibertaria.news/?s=';
    this.publisher = 'gazeta_libertaria';
    this.elementsSelector = '.post';
  }

  protected extractArticleItem($: CheerioAPI, element): ArticleDto | null {
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
      publisher: this.publisher,
      resume: this.getElementValue(element, '.entry-summary p'),
      date: date ? date : DateHelper.getDateNow().toISOString(),
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
