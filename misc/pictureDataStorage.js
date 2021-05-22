const fs = require('fs');

const pictureDataFileName = 'pictureData.json';

class PictureDataStorage {
    #data;

    constructor() {
        this.load();
    }

    load() {
        try {
            this.data = JSON.parse(fs.readFileSync(pictureDataFileName).toString('utf-8'));
        } catch (e) {
            this.data = new Object();
        }
    }

    save() {
        fs.writeFileSync(pictureDataFileName, JSON.stringify(this.data));
    }

    setFilename(newFilename) {
        this.data.filename = newFilename;
    }

    filename() {
        if (!this.filenameExists()) {
            return '';
        }

        return this.data.filename;
    }

    filenameExists() {
        if (this.data.filename === undefined || this.data.filename.length === 0) {
            return false;
        }
            
        return true;
    }

    points() {
        if (this.data.points === undefined) {
            return [];
        }

        return this.data.points;
    }

    setPoints(pPoints) {
        this.data.points = pPoints;
    }
}

module.exports = PictureDataStorage;