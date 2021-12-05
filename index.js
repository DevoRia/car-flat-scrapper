import {getDriver} from "./driver/driver.js";
import {Autoria} from "./resources/autoria/index.js";

const driver = getDriver();
(async () => {
  const a = await new Autoria(driver).parse()
  driver.quit();
})();
