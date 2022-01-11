import {By} from "selenium-webdriver";
import {Repository} from "../database/repository";

export class Resource {
  url;
  filter;
  driver;
  repository;

  LIST_ELEMENTS;

  constructor(driver, model, modelUpdate) {
    this.repository = new Repository(model, modelUpdate);
    this.driver = driver;
  }

  async parse() {
    try {
      await this.driver.get(this.url + this.filter)
      const listItems = await this.driver.findElements(By.xpath(this.LIST_ELEMENTS));
      return await Promise.all(listItems.map(this.parseElement.bind(this)));

    } catch (e) {
      console.error(e);
      return [];
    }
  }

  parseElement(_, i) {
  }

}