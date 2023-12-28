const { scrapeETFData } = require('./scrapeLogic');
const { writeETFDataToCSV } = require('./csvWriter');

async function run() {
    const records = await scrapeETFData();
    await writeETFDataToCSV(records);
}

run();
