import {Autoria} from "../resources/autoria";
import {getDriver} from "../driver/driver";
import {Rst} from "../resources/rst";

const CronJob = require('cron').CronJob;

let driver;

export function runJobs() {
  const job = new CronJob('*/30 * * * *', async function() {
    console.log('RUN JOB:', new Date())
    driver = getDriver();
    const resultsAr = await new Autoria(driver).parse();
    const resultsRst = await new Rst(driver).parse();
    console.log(calculateResults(resultsAr.concat(resultsRst)), new Date())
    await driver.quit();
  });
  job.start();
}


function calculateResults(results) {
  const created = results.filter(val => val === 'new').length;
  const updated = results.filter(val => val === 'upd').length;

  return {
    created,
    updated
  }
}