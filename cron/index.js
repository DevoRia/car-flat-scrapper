import {getDriver} from "../driver/driver";
import {AutoRia} from "../resources/autoria";
import {sendNotification} from "../expo";

const CronJob = require('cron').CronJob;

let driver;

export function runJobs() {
  if (process.env.CRONLESS) {
    jobFn().then(() => process.exit(0));
  } else {
    const job = new CronJob('*/10 * * * *', jobFn);
    job.start();
  }
}


function calculateResults(results) {
  const created = results.filter(val => val && val.status === 'new');
  const updated = results.filter(val => val && val.status === 'upd').length;
  sendNotification(created.map(item => item.data))

  return {
    created: created.length,
    updated
  }
}

async function jobFn() {
  console.log('RUN JOB:', new Date())
  driver = getDriver();

  const count = await [AutoRia]
      .reduce((promise, resource) => promise
          .then(async (result) => {
            const currentResult = await new resource(driver).parse();
            return result.concat(currentResult);
          }),
        Promise.resolve([]));

  console.log(calculateResults(count), new Date())
  await driver.quit();
}