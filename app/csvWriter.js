const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function writeETFDataToCSV(records) {
    const csvWriter = createCsvWriter({
        path: 'output.csv',
        header: [
            { id: 'symbol', title: 'Symbol' },
            { id: 'name', title: 'Name' },
            { id: 'assets', title: 'Assets' },
        ],
    });

    try {
        await csvWriter.writeRecords(records);
        console.log("CSV file created successfully");
    } catch (error) {
        console.error("Error writing to CSV", error);
    }
}

module.exports = {
    writeETFDataToCSV,
};
