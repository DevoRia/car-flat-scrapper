import {By} from "selenium-webdriver";
import {Resource} from "./resource";
import {Car, CarUpdate} from "../database/models/car";

export class AutoRia extends Resource {

  url = 'https://auto.ria.com'
  filter = process.env.AUTORIA_FILTER;
  driver;

  LIST_ELEMENTS = '//div[@class="content-bar"]'
  TITLE = "//div[@class='content']/div[@class='head-ticket']//a"
  PHOTO = "//div[@class='ticket-photo loaded']//picture/img"
  PRICE_USD = "//div[@class='content']/div[@class='price-ticket']"
  PRICE_UAH = '//div[@class="content"]/div[@class="price-ticket"]//span[@data-currency="UAH"]'
  RACE = '//div[@class="definition-data"]//li[contains(@class,"js-race")]'
  LOCATION = '//div[@class="definition-data"]//li[contains(@class,"js-location")]'
  FUEL = '//div[@class="definition-data"]//li/i[@class="icon-fuel"]/..'
  TYPE_TRANSMISSION = '//div[@class="definition-data"]//ul[contains(@class,"characteristic")]//li[4]'
  DESCRIPTION = '//div[@class="definition-data"]//p[contains(@class,"descriptions-ticket")]//span'
  DATE = '//div[@class="footer_ticket"]/span'

  constructor(driver) {
    super(driver, Car, CarUpdate);
  }

  async parseElement(_, i) {
      const titleData = await this.parseTitleData(i);

      const updateStatus = await this.repository.checkForUpdate(titleData.id, titleData.dateUpdate);

      if (!updateStatus) {
        return;
      }

      const priceData = await this.parsePrice(i);
      const options = await this.parseOptions(i);

      const data = {
        provider: 'autoria',
        ...titleData,
        ...priceData,
        ...options,
      }

      if (updateStatus === 'new') {
        await this.repository.save(data)
        return {status: updateStatus, data };
      } else {
        await this.repository.update(updateStatus, data)
        return {status: 'upd', data };
      }
  }

  async parseTitleData(i) {
    const titleEl = await this.driver.findElement(By.xpath(`(${this.TITLE})[${i + 1}]`));
    const dateEl = await this.driver.findElement(By.xpath(`(${this.DATE})[${i + 1}]`));

    const dateCreate = await dateEl.getAttribute('data-add-date');
    const dateUpdate = await dateEl.getAttribute('data-update-date');

    const title = await titleEl.getAttribute('title');

    let photo;

    try {
      const photoEl = await this.driver.findElement(By.xpath(`(${this.PHOTO})[${i + 1}]`));
      photo = await photoEl.getAttribute('src') || '';
    } catch (e) {
      console.log(title, 'image error.');
    }
    const viewTitle = await titleEl.getText();
    const link = await titleEl.getAttribute('href');
    const idMatcher = link.match('_[0-9]*\\.html');
    const id = (idMatcher && idMatcher[0]) ? idMatcher[0].replace('_', '').replace('.html', '') : null;

    return {
      title,
      viewTitle,
      link,
      id,
      photo,
      dateUpdate,
      dateCreate
    }
  }

  async parsePrice(i) {
    const priceUsdEl = await this.driver.findElement(By.xpath(`(${this.PRICE_USD})[${i + 1}]`));
    const priceUahEl = await this.driver.findElement(By.xpath(`(${this.PRICE_UAH})[${i + 1}]`));

    const mainPrice = Number(await priceUsdEl.getAttribute('data-main-price'));
    const uah = Number((await priceUahEl.getText()).replace(' ', ''));

    return {
      usd: mainPrice,
      uah
    }
  }

  async parseOptions(i) {
    const raceEl = await this.driver.findElement(By.xpath(`(${this.RACE})[${i + 1}]`));
    const locationEl = await this.driver.findElement(By.xpath(`(${this.LOCATION})[${i + 1}]`));
    const fuelEl = await this.driver.findElement(By.xpath(`(${this.FUEL})[${i + 1}]`));
    const transmissionEl = await this.driver.findElement(By.xpath(`(${this.TYPE_TRANSMISSION})[${i + 1}]`));
    const descriptionEl = await this.driver.findElement(By.xpath(`(${this.DESCRIPTION})[${i + 1}]`));

    const race = Number((await raceEl.getText()).match('[0-9]*')[0]) * 1000;
    const location = await locationEl.getText();
    const fuel = await fuelEl.getText();
    const transmission = await transmissionEl.getText();
    const description = await descriptionEl.getText();

    return {
      race,
      location,
      fuel,
      transmission,
      description
    }
  }

}