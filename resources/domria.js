import {Resource} from "./resource";
import {Flat, FlatUpdate} from "../database/models/flat";

export class DomRia extends Resource {

  url = 'https://dom.ria.com/'
  filter = process.env.DOMRIA_FILTER;
  driver;

  constructor(driver) {
    super(driver, Flat, FlatUpdate);
  }

  async parseElement(_, i) {

  }

}