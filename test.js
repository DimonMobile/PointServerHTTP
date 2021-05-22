const SerialPort = require('SerialPort');
const Delimiter = require('@SerialPort/parser-delimiter');

const serial = new SerialPort('COM3');

async function doJob() {
    await serial.write('state');
}

serial.on('data', (chunk) => {
    console.log(chunk.toString('utf-8'));
});

doJob();