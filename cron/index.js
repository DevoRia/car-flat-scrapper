import {getDriver} from "../driver/driver";
import {AutoRia} from "../resources/autoria";
import {Rst} from "../resources/rst";

const CronJob = require('cron').CronJob;

let driver;

export function runJobs() {
  if (process.env.CRONLESS) {
    jobFn().then(() => process.exit(0));
  } else {
    const job = new CronJob('*/30 * * * *', jobFn);
    job.start();
  }
}


function calculateResults(results) {
  const created = results.filter(val => val === 'new').length;
  const updated = results.filter(val => val === 'upd').length;

  return {
    created,
    updated
  }
}

async function jobFn() {
  console.log('RUN JOB:', new Date())
  driver = getDriver();

  const count = await [AutoRia, Rst]
      .reduce((promise, resource) => promise
          .then(async (result) => {
            const currentResult = await new resource(driver).parse();
            return result.concat(currentResult);
          }),
        Promise.resolve([]));

  console.log(calculateResults(count), new Date())
  await driver.quit();
}