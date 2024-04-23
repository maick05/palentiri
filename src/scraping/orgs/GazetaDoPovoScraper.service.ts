import { Injectable } from '@nestjs/common';
import { AbstractScraperService } from '../AbstractScraperService';
import { Article } from 'src/interface/Article';
import { CheerioAPI } from 'cheerio';

@Injectable()
export class GazetaDoPovoScraperService extends AbstractScraperService {
  constructor() {
    super();
    this.url = 'https://www.gazetadopovo.com.br/ultimas-noticias';
    this.companyName = 'gazeta_povo';
    this.elementsSelector = '.item-list';
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
    const link = this.getElementValue(element, '.trigger-gtm', 'href');

    const { title } = this.getTitleLink(link);

    const category = this.getCategory(link);

    if (['esporte', 'generico'].includes(category)) return null;

    const date = this.getElementValue(element, '.publish-at');

    const categoryLink =
      link.split('/').length > 1 ? link.split('/')[1] : category;

    return {
      orgId: this.getOrgId(
        link.replace(`${categoryLink}/`, `${categoryLink}__`).replace('/', ''),
      ),
      title: this.getElementValue(element, '.post-title', '', title),
      category: category,
      author: '',
      link: `${this.url}${link}`,
      company: this.companyName,
      resume: this.getElementValue(element, '.post-caption'),
      date: date ? this.parseISO(date) : new Date().toISOString(),
    };
  }

  private getCategory(link): string {
    const tag = link.split('/').length > 1 ? link.split('/')[1] : '';
    switch (tag.toLowerCase()) {
      case 'mundo':
      case 'brasil':
        return 'politica';
      case 'economia':
        return 'economia';
      case 'esportes':
        return 'esporte';
      case 'ideias':
      case 'vida-e-cidadania':
        return 'generico';
      default:
        return 'politica';
    }
  }
}
