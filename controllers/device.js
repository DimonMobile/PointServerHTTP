const mime = require('mime-types');
const fs = require('fs');
const path = require('path');

const settings = require('../config');

const SerialPort = require('serialport');
const Delimiter = require('@serialport/parser-delimiter');

const PictureDataStorage = require('../misc/pictureDataStorage');
const { delimiter } = require('path');

module.exports = {
    status_get: function (req, res) {
        let respObject = {
            status: 'running'
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).contentType('application/json').end(JSON.stringify(respObject));
    },

    picture_get: function (req, res) {
        const pictureDataStorage = new PictureDataStorage();
        pictureDataStorage.load();

        if (!pictureDataStorage.filenameExists()) {
            res.status(200).json({ info: 'no picture' });
        } else {
            let mimeType = mime.contentType(path.extname(pictureDataStorage.filename().toString('utf-8')));
            res.contentType(mimeType).status(200).end(fs.readFileSync(pictureDataStorage.filename()));
        }
    },

    picture_post: function (req, res) {
        const pictureDataStorage = new PictureDataStorage();
        pictureDataStorage.load();

        if (fs.existsSync(pictureDataStorage.filename())) {
            fs.unlinkSync(pictureDataStorage.filename());
        }

        let collected = []
        req.on('data', (chunk) => {
            collected.push(chunk);
        });

        req.on('end', () => {
            let buffer = Buffer.concat(collected);
            let extension = mime.extension(req.headers['content-type']);

            pictureDataStorage.setFilename(`data.${extension}`);
            fs.writeFileSync(pictureDataStorage.filename(), buffer);

            pictureDataStorage.save();
            res.status(200).end();
        });
    },

    points_get: function (req, res) {
        const pictureDataStorage = new PictureDataStorage();
        pictureDataStorage.load();

        const serial = new SerialPort(settings.DEVICE_PORT);
        serial.write('info');

        let parser = serial.pipe(new Delimiter({delimiter: '\r\n\r\n'}));

        parser.on('data', (data) => {
            serial.close();
            let splitted = data.toString().split('\r\n');

            if (pictureDataStorage.points().length === 0) {
    
                const slavesNumber = parseInt(splitted[2]);
                let preparedPoints = [];
                for (let i = 0; i < slavesNumber; ++i) {
                    preparedPoints.push({
                        x: 0.0,
                        y: 0.0,
                        name: `Toggler device ${i + 1}`,
                    });
                }
                pictureDataStorage.setPoints(preparedPoints);
                pictureDataStorage.save();
            }
    
            res.status(200).contentType('application/json').end(JSON.stringify(pictureDataStorage.points()));
        });
    },

    points_post: function (req, res) {
        const pictureDataStorage = new PictureDataStorage();
        pictureDataStorage.load();

        let collected = [];
        req.on('data', (chunk) => {
            collected.push(chunk);
        });

        req.on('end', () => {
            let buffer = Buffer.concat(collected);
            console.log(buffer.toString('utf-8'));
            let points = JSON.parse(buffer.toString('utf-8'));

            pictureDataStorage.setPoints(points);
            pictureDataStorage.save();

            res.status(200).end();
        });
    },

    state_get: function (req, res) {
        const serial = new SerialPort(settings.DEVICE_PORT);
        serial.write('state');

        let parser = serial.pipe(new Delimiter({delimiter: '\r\n\r\n'}));

        parser.on('data', (data) => {
            serial.close();

            let splitted = data.toString().split(' ');
            let filtered = splitted.filter(function(el) {
                return el !== ''
            });

            let mapped = filtered.map(el => {
                return el === '1' ? true : false;
            });

            res.status(200).contentType('json').end(JSON.stringify(mapped));
        });

    },

    state_post: async function (req, res) {
        try {
            let slaveId = parseInt(req.params.id);
            let newState = req.params.state;

            // TODO: ask from device
            if (slaveId < 0 || slaveId >= 4) {
                throw new Error('Invaid slaveid');
            }

            console.log(newState);
            if (newState !== 'active' && newState !== 'inactive') {
                throw new Error('Unknow state');
            }

            const serial = new SerialPort(settings.DEVICE_PORT);
            const toWrite = (newState === 'active') ? `on${slaveId+1}` : `off${slaveId+1}`;
            serial.write(toWrite);
            serial.on('data', () => {
                serial.close();
                res.status(200).json({status: 'ok'});
            });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }

    }
}