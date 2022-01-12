import {By} from "selenium-webdriver";
import {Resource} from "./resource";
import {Flat, FlatUpdate} from "../database/models/flat";

export class Olx extends Resource {

  url = 'https://www.olx.ua'
  filter = process.env.OLX_FILTER;
  driver;

  LIST_ELEMENTS = '//tr[@class="wrap"]';
  TABLE = '//td[contains(@class,"offer")]/div[@class="offer-wrapper"]/table'
  TITLE = this.TABLE + "//td[contains(@class,'title-cell')]//h3/a"
  PRICE_UAH = this.TABLE + '//p[@class="price"]'
  LOCATION = this.TABLE + '//td[@class="bottom-cell"]//i[@data-icon="location-filled"]/..'
  DATE = this.TABLE + '//td[@class="bottom-cell"]//i[@data-icon="clock"]/..'

  constructor(driver) {
    super(driver, Flat, FlatUpdate);
  }

  async parseElement(_, i) {
    const titleData = await this.parseTitleData(i);
    const updateStatus = await this.repository.checkForUpdate(titleData.id, titleData.dateUpdate);

    if (!updateStatus) {
      return;
    }

    const options = await this.parseOptions(i);

    const data = {
      provider: 'olx',
      ...titleData,
      ...options,
    }

    if (updateStatus === 'new') {
      await this.repository.save(data)
      return updateStatus;
    }
  }

  async parseTitleData(i) {
    const tableEl = await this.driver.findElement(By.xpath(`(${this.TABLE})[${i + 1}]`));
    const titleEl = await this.driver.findElement(By.xpath(`(${this.TITLE})[${i + 1}]`));

    const id = await tableEl.getAttribute('data-id');

    const title = await titleEl.getText();
    const link = await titleEl.getAttribute('href');

    return {
      title,
      viewTitle: title,
      link,
      id,
      dateUpdate: new Date(),
    }
  }

  async parseOptions(i) {
    const priceEl = await this.driver.findElement(By.xpath(`(${this.PRICE_UAH})[${i + 1}]`));
    const locationEl = await this.driver.findElement(By.xpath(`(${this.LOCATION})[${i + 1}]`));
    const dateEl = await this.driver.findElement(By.xpath(`(${this.DATE})[${i + 1}]`));
    const price = await priceEl.getText();
    const location = await locationEl.getText();
    const date = await dateEl.getText();

    return {
      uah: Number(price.replace(/ /g, '').replace(/'/g, '').replace("грн.", '')),
      location,
      dateCreate: date,
      dateUpdate: date,
    }
  }


}