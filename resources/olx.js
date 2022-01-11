import {By} from "selenium-webdriver";
import {Resource} from "./resource";
import {Flat, FlatUpdate} from "../database/models/flat";

export class Olx extends Resource {

  url = 'https://www.olx.ua'
  filter = process.env.OLX_FILTER;
  driver;

  constructor(driver) {
    super(driver, Flat, FlatUpdate);
  }

  async parseElement(_, i) {
  }
}