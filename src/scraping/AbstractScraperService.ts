/* eslint-disable @typescript-eslint/no-this-alias */
import { BadRequestException, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import { HEADLESS } from 'src/constants/browser';
import { Article } from 'src/interface/Article';

export abstract class AbstractScraperService {
  protected ignoreCategories = ['esporte'];
  protected browser: puppeteer.Browser;
  protected url: string;
  protected validSufixes = [];
  protected logger: Logger = new Logger(AbstractScraperService.name);

  private async initBrowser() {
    this.browser = await puppeteer.launch({
      headless: HEADLESS,
      args: ['--start-maximized'],
    });
  }

  protected async goToPage(sufix = ''): Promise<puppeteer.Page> {
    await this.initBrowser();
    const page = await this.browser.newPage();
    await page.setViewport({ width: 1380, height: 1080 });

    this.logger.log(`Chamando url... ${this.url}/${sufix}`);
    await page.goto(`${this.url}/${sufix}`, { waitUntil: 'networkidle2' });
    return page;
  }

  public async scrapeNewsList(sufix = ''): Promise<Article[]> {
    if (this.validSufixes.length && !this.validSufixes.includes(sufix))
      throw new BadRequestException('Invalid Sufix');
    const page = await this.goToPage(sufix);
    const items = await this.evaluate(page, sufix);
    if (HEADLESS) await this.closeBrowser();
    return items;
  }

  protected abstract evaluate(page: Page, sufix?: string): Promise<Article[]>;

  public async closeBrowser() {
    await this.browser.close();
  }
}