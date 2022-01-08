import {By} from "selenium-webdriver";
import {checkForUpdate, saveCar} from "../../database/models/car.js";

export class Rst {

  url = 'https://rst.ua'
  filter = process.env.RST_FILTER;
  driver;

  LIST_ELEMENTS = '//div[contains(@class,"rst-ocb-i rst-ocb-i-premium rst-uix-radius roiv")]|//div[contains(@class,"rst-ocb-i roiv")]'
  TITLE = "//div[contains(@class,'rst-ocb-i')]/a[@class='rst-ocb-i-a']"
  PRICE_USD = '//span[@class="rst-uix-grey"]'
  PRICE_UAH = "//span[contains(@class,'rst-ocb-i-d-l-i-s rst-ocb-i-d-l-i-s-p')]"
  RACE = "//li[@class='rst-ocb-i-d-l-i'][contains(text(),'Год:')]"
  LOCATION = '//span[@class="rst-ocb-i-d-l-i-s"]/strong'
  DESCRIPTION = '//div[@class="rst-ocb-i-d-d"]'
  DATE = '//div[@class="rst-ocb-i-s"]/i|//div[@class="rst-ocb-i-s"]/b[@class=" rst-ocb-i-s-fresh"]'

  constructor(driver) {
    this.driver = driver;
  }

  async parse() {
    try {
      await this.driver.get(this.url + this.filter)
      const listItems = await this.driver.findElements(By.xpath(this.LIST_ELEMENTS));

      return await Promise.all(listItems.map(async (_, i) => {
        const titleData = await this.parseTitleData(i);
        const priceData = await this.parsePrice(i);
        const options = await this.parseOptions(i);

        const updateStatus = await checkForUpdate(titleData.id, titleData.dateUpdate);

        if (!updateStatus) {
          return;
        }

        const data = {
          provider: 'rst',
          ...titleData,
          ...priceData,
          ...options,
        }

        await saveCar(data)
        return updateStatus;
      }))

    } catch (e) {
      console.error(e);
      return [];
    }
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
    const raceEl = await this.driver.findElement(By.xpath(`(${this.RACE})[${i + 1}]`));
    const locationEl = await this.driver.findElement(By.xpath(`(${this.LOCATION})[${i + 1}]`));
    const descriptionEl = await this.driver.findElement(By.xpath(`(${this.DESCRIPTION})[${i + 1}]`));

    const race = Number((await raceEl.getText()).match('\(([0-9].*?)\)')[0].replace('(', '').replace(' - пробег)', ''));
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