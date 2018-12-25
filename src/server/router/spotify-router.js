const Router = require('koa-router');
const spotifyController = require('../controller/spotify-controller');
const router = new Router({
  prefix: '/api/spotify'
});

router.get('/', spotifyController.search);
router.get('/authorization', spotifyController.authorization);
router.get('/token', spotifyController.token);

module.exports = router;
