const puppeteer = require("puppeteer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

process.env.BROWSER_WS_ENDPOINT = "";

async function run() {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(2 * 60 * 1000);

        console.log("Navigating to the page...");
        await page.goto(
            "https://etfdb.com/screener/#page=1&fifty_two_week_start=47.4&five_ytd_start=0.96",
        );

        const selector = 'td[data-th="Symbol"] a';
        await page.waitForSelector(selector);

        const symbols = await page.$$eval(selector, (symbols) =>
            symbols.map((symbol) => ({
                ETFsymbol: symbol.innerText,
                symbolHref: symbol.getAttribute("href"),
            })),
        );

        const csvWriter = createCsvWriter({
            path: 'output.csv',
            header: [
                { id: 'symbol', title: 'Symbol' },
                { id: 'name', title: 'Name' },
                { id: 'assets', title: 'Assets' },
            ],
        });

        const records = [];

        for (const symbolData of symbols) {
            const ETFurl = `https://etfdb.com${symbolData.symbolHref}#holdings`;

            console.log(`Navigating to ${ETFurl}...`);
            await page.goto(ETFurl);

            const holdingsInfo = await page.$$eval(
                "#etf-holdings > tbody > tr",
                (holdings) => {
                    return holdings.map((holding, i) => {
                        const symbol = holding
                            .querySelector(`td[data-th="Symbol"]`)
                            .textContent.trim();
                        const name = holding
                            .querySelector(`td[data-th="Holding"]`)
                            .textContent.trim();
                        const assets = holding
                            .querySelector(`td[data-th="% Assets"]`)
                            .textContent.trim();

                        return { symbol, name, assets };
                    });
                },
            );

            records.push(...holdingsInfo);
        }

        await csvWriter.writeRecords(records);

        console.log("CSV file created successfully");
    } catch (e) {
        console.error("Scrape failed", e);
    } finally {
        await browser?.close();
    }
}

run();

