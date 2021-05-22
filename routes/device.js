const controller = require('../controllers/device');

const router = require('express').Router();

router.get('/status', controller.status_get);

router.post('/picture', controller.picture_post);
router.get('/picture', controller.picture_get);

router.post('/points', controller.points_post);
router.get('/points', controller.points_get);

router.get('/state', controller.state_get);
router.post('/state/:id/:state', controller.state_post);

module.exports = router;