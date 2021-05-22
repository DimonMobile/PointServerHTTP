const express = require('express');
const app = express();
const settings = require('./config');

const deviceRouter = require('./routes/device');

app.use('/device', deviceRouter);

app.listen(settings.APP_PORT, () => {
    // TODO: communicate with device
    console.log(`pointserver started at ${settings.APP_PORT}`);
});
