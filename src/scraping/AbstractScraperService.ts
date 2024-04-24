/* eslint-disable @typescript-eslint/no-this-alias */
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import { HEADLESS } from 'src/constants/browser';
import { Article } from 'src/interface/Article';
import cheerio, { Cheerio, CheerioAPI } from 'cheerio';

export abstract class AbstractScraperService {
  protected ignoreCategories = ['esporte'];
  protected browser: puppeteer.Browser;
  protected url: string;
  protected validSufixes = [];
  protected logger: Logger = new Logger(AbstractScraperService.name);
  protected companyName;
  protected elementsSelector;

  private async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: HEADLESS,
        args: ['--start-maximized'],
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Erro ao iniciar browser: ${JSON.stringify(err)}`,
      );
    }
  }

  protected async goToPage(sufix = ''): Promise<puppeteer.Page> {
    await this.initBrowser();
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
      );

      await page.setViewport({ width: 1380, height: 1080 });
      const url = sufix ? `${this.url}/${sufix}` : this.url;
      this.logger.log(`Chamando url... '${url}'`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      return page;
    } catch (err) {
      throw new InternalServerErrorException(
        `Erro ao carregar página: ${JSON.stringify(err)}`,
      );
    }
  }

  public async scrapeNewsList(sufix = ''): Promise<Article[]> {
    if (
      (this.validSufixes.length && !this.validSufixes.includes(sufix)) ||
      (!this.validSufixes.length && sufix.length)
    )
      throw new BadRequestException('Invalid Sufix');

    const page = await this.goToPage(sufix);
    let contentHtml;
    try {
      contentHtml = await this.evaluate(page, sufix);
    } catch (err) {
      throw new InternalServerErrorException(
        `Erro ao evaluate pagina: ${JSON.stringify(err)}`,
      );
    }
    const items = this.extractItems(contentHtml, sufix);
    return this.cleanItems(items);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async evaluate(page: Page, sufix?: string): Promise<CheerioAPI> {
    const html = await page.content();
    if (HEADLESS) await this.closeBrowser();
    return cheerio.load(html);
  }

  protected extractItems($: CheerioAPI, sufix = ''): Article[] {
    const articles = [];
    let elements;
    try {
      elements = $(this.elementsSelector).slice(0, 39);
    } catch (err) {
      throw new InternalServerErrorException(
        `Erro carregar html Cheerio: ${JSON.stringify(err)}`,
      );
    }

    if (!elements.length) return [];
    elements.each((i, elem) => {
      try {
        const item = this.extractArticleItem($, $(elem), sufix);
        if (!item) return;
        articles.push(item);
      } catch (err) {
        throw new InternalServerErrorException(
          `Erro ao extrair item '${elem}': ${JSON.stringify(err)}`,
        );
      }
    });
    return articles;
  }

  protected abstract extractArticleItem(
    $: CheerioAPI,
    element,
    sufix?: string,
  ): Article;

  public async closeBrowser() {
    await this.browser.close();
  }

  protected getElementValue(
    element: Cheerio<Element> | any,
    selector: string,
    attr = '',
    defaultValue = '',
  ): string {
    return element.find(selector).length
      ? attr
        ? element.find(selector).attr(attr)
        : element.find(selector).text()
      : defaultValue;
  }

  protected getTitleLink(link: string): { title: string; titleStr: string } {
    const titleStr = link.split('-').join(' ');
    return {
      titleStr,
      title:
        titleStr.charAt(0).toUpperCase() + titleStr.slice(1, -1).toLowerCase(),
    };
  }

  protected getOrgId(link: string): string {
    return link.split('-').join('_').replace('/', '');
  }

  protected cleanItems(articles: Article[]): Article[] {
    // return articles;
    const seen = new Map();
    return articles.filter((article) => {
      if (!seen.has(article.orgId)) {
        seen.set(article.orgId, true);
        return true;
      }
      return false;
    });
  }
}
