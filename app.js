import {runMongo} from "./database/mongoose.js";
import {runJobs} from "./cron";

(async () => {
  await runMongo();
  await runJobs();
})();
