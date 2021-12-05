import webdriver from "selenium-webdriver";

export function getDriver() {
  return new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
}