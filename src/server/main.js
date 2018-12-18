const path = require('path');

const Koa = require('koa');
const serve = require('koa-static');
const cors = require('@koa/cors');
const Router = require('koa-router');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');

const PORT = 8080;
const app = new Koa();

require('dotenv').config();
global.KEYS = [];
[
  'API_KEY_TIM',
  'API_KEY_MARLEN',
  'API_KEY_ALEX',
  'API_KEY_DANI',
  'API_KEY_SARAH',
  'API_KEY_JANNIK',
  'API_KEY_MAEULE',
  'API_KEY_PAKKU',
  'API_KEY_UDO'
].forEach(user => {
  global.KEYS.push(process.env[user]);
});

/* Connect to DB */
const mongoose = require('mongoose');
mongoose.mon;
mongoose.connect(
  `mongodb://${process.env.MONGODB_USER}:${
    process.env.MONGODB_PW
  }@ds137404.mlab.com:37404/playlist-poll`,
  { useNewUrlParser: true },
  err => {
    if (err) throw err;
    console.log('Connected to Database');
  }
);

/* Middleware */
app.use(logger());
app.use(cors());
app.use(bodyParser());

app.use(async (ctx, next) => {
  const appCredentials = ctx.request.header['x-app-credentials'];
  if (appCredentials) {
    const buffer = new Buffer(appCredentials, 'base64');
    const [username, passwort] = buffer.toString('ascii').split(process.env.AUTH_SEPERATOR);

    if (global.KEYS.includes(appCredentials)) {
      ctx.state.credentials = { username, passwort, encoded: appCredentials };
      return next();
    }
  }
  ctx.status = 401;
  ctx.body = 'Unauthorized';
});

/* Routes */
const router = new Router();
app.use(router.allowedMethods());

const songRouter = require('./router/song-router');
app.use(songRouter.routes());

const spotifyRouter = require('./router/spotify-router');
app.use(spotifyRouter.routes());

/* Serve static react webpage */
app.use(serve(path.join(__dirname, '..', '..', 'dist')));

/* Error Handling */
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

app.on('error', (err, ctx) => {
  console.log(err);
});

app.listen(8080, () => console.log(`Listening on http://localhost:${PORT}`));