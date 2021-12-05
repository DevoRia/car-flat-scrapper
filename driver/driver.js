require('chromedriver');

import webdriver from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

export function getDriver() {
  return new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().headless())
    .build();
}