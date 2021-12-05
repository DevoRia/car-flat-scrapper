import {getDriver} from "./driver/driver.js";
import {Autoria} from "./resources/autoria/index.js";
import {runMongo} from "./database/mongoose.js";

const driver = getDriver();
(async () => {
  await runMongo();
  await new Autoria(driver).parse()
  driver.quit();
})();
