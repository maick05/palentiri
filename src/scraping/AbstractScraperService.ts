/* eslint-disable @typescript-eslint/no-this-alias */
import { BadRequestException, Logger } from '@nestjs/common';
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

  private async initBrowser() {
    this.browser = await puppeteer.launch({
      headless: HEADLESS,
      args: ['--start-maximized'],
    });
  }

  protected async goToPage(sufix = ''): Promise<puppeteer.Page> {
    await this.initBrowser();
    const page = await this.browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
    );

    await page.setViewport({ width: 1380, height: 1080 });

    this.logger.log(`Chamando url... ${this.url}/${sufix}`);
    await page.goto(`${this.url}/${sufix}`, { waitUntil: 'networkidle2' });
    return page;
  }

  public async scrapeNewsList(sufix = ''): Promise<Article[]> {
    if (this.validSufixes.length && !this.validSufixes.includes(sufix))
      throw new BadRequestException('Invalid Sufix');

    const page = await this.goToPage(sufix);
    const contentHtml = await this.evaluate(page, sufix);
    const items = this.extractItems(contentHtml, sufix);

    return items;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async evaluate(page: Page, sufix?: string): Promise<CheerioAPI> {
    const html = await page.content();
    if (HEADLESS) await this.closeBrowser();
    return cheerio.load(html);
  }

  protected abstract extractItems(
    $: CheerioAPI,
    sufix?: string,
  ): Promise<Article[]>;

  public async closeBrowser() {
    await this.browser.close();
  }

  protected async getElementValue(
    element: Cheerio<Element> | any,
    selector: string,
    attr = '',
    defaultValue = '',
  ): Promise<string> {
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
}
