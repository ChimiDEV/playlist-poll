const Router = require('koa-router');
const songController = require('../controller/song-controller');
const router = new Router({
  prefix: '/api/songs'
});

router.get('/', songController.all)
router.get('/:id', songController.get)
router.post('/', songController.post)
router.put('/:id', songController.put)
router.delete('/:id', songController.delete)

module.exports = router;