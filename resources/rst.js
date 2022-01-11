import {By} from "selenium-webdriver";
import {Resource} from "./resource";
import {Car, CarUpdate} from "../database/models/car";

export class Rst extends Resource {

  url = 'https://rst.ua'
  filter = process.env.RST_FILTER;
  driver;

  LIST_ELEMENTS = '//div[contains(@class,"rst-ocb-i rst-ocb-i-premium rst-uix-radius roiv")]|//div[contains(@class,"rst-ocb-i roiv")]'
  TITLE = "//div[contains(@class,'rst-ocb-i')]/a[@class='rst-ocb-i-a']"
  PRICE_USD = '//span[@class="rst-uix-grey"]'
  PRICE_UAH = "//span[contains(@class,'rst-ocb-i-d-l-i-s rst-ocb-i-d-l-i-s-p')]"
  LOCATION = '//span[@class="rst-ocb-i-d-l-i-s"]/strong'
  DESCRIPTION = '//div[@class="rst-ocb-i-d-d"]'

  constructor(driver) {
    super(driver, Car, CarUpdate)
  }

  async parseElement(_, i) {
    const titleData = await this.parseTitleData(i);
    const priceData = await this.parsePrice(i);
    const options = await this.parseOptions(i);

    const updateStatus = await this.repository.checkForUpdate(titleData.id, titleData.dateUpdate);

    if (!updateStatus) {
      return;
    }

    const data = {
      provider: 'rst',
      ...titleData,
      ...priceData,
      ...options,
    }

    await this.repository.save(data)
    return updateStatus;
  }

  async parseTitleData(i) {
    const titleEl = await this.driver.findElement(By.xpath(`(${this.TITLE})[${i + 1}]`));
    const title = await titleEl.getText();
    const link = await titleEl.getAttribute('href');
    const idMatcher = link.match('_[0-9]*\\.html');
    const id = (idMatcher && idMatcher[0]) ? idMatcher[0].replace('_', '').replace('.html', '') : null;

    return {
      title,
      viewTitle: title,
      link,
      id,
      dateUpdate: new Date(),
      dateCreate: new Date()
    }
  }

  async parsePrice(i) {
    const priceUsdEl = await this.driver.findElement(By.xpath(`(${this.PRICE_USD})[${i + 1}]`));
    const priceUahEl = await this.driver.findElement(By.xpath(`(${this.PRICE_UAH})[${i + 1}]`));

    const mainPrice = Number((await priceUsdEl.getText()).replace(' ', '').replace(/'/g, '').replace("$", ''));
    const uah = Number((await priceUahEl.getText()).replace(' ', '').replace(/'/g, '').replace("грн", ''));

    return {
      usd: mainPrice,
      uah
    }
  }

  async parseOptions(i) {
    const locationEl = await this.driver.findElement(By.xpath(`(${this.LOCATION})[${i + 1}]`));
    const descriptionEl = await this.driver.findElement(By.xpath(`(${this.DESCRIPTION})[${i + 1}]`));
    const location = await locationEl.getText();
    const description = await descriptionEl.getText();

    return {
      race: '',
      location,
      fuel: '',
      transmission: '',
      description
    }
  }

}