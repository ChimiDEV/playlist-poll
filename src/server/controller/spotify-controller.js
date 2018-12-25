const request = require('request-promise-native');

class SpotifyClient {
  constructor(clientID, clientSecret, scopes, redirectURL, locale) {
    this.clientID = clientID;
    this.clientSecret = clientSecret;
    this.scopes = scopes;
    this.locale = locale;
    this.clientAccessToken = '';
    this.refreshToken = '';
    this.baseURL = 'https://api.spotify.com/v1';
    this.OAuthURL = 'https://accounts.spotify.com';
    this.redirectURL = redirectURL;
    this.clientAuthorization();
  }

  async clientAuthorization() {
    // 1. Have your application request authorization
    // https://developer.spotify.com/documentation/general/guides/authorization-guide/#client-credentials-flow
    try {
      const response = await request.post(`${this.OAuthURL}/api/token`, {
        form: {
          grant_type: 'client_credentials'
        },
        auth: {
          user: this.clientID,
          pass: this.clientSecret
        }
      });
      this.clientAccessToken = JSON.parse(response).access_token;
      return Promise.resolve();
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }

  async userAuthorization(code) {
    try {
      // API is called by spotify
      const response = await request.post(`${this.OAuthURL}/api/token`, {
        form: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectURL
        },
        auth: {
          user: this.clientID,
          pass: this.clientSecret
        }
      });
      this.accessToken = JSON.parse(response).access_token;
      this.refreshToken = JSON.parse(response).refresh_token;
      return Promise.resolve();
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }

  async search(query, type, limit) {
    const url = `${this.baseURL}/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(
      type
    )}&market=${this.locale}&limit=${limit}`;
    const options = {
      url,
      method: 'GET',
      auth: {
        bearer: this.clientAccessToken
      }
    }
    try {
      const response = await request(options);
      return Promise.resolve(JSON.parse(response));
    } catch (err) {
      return this.refreshedRetryClient(options);
    }
  }

  async refreshedRetryClient(options) {
    // Try again with new access token:
    await this.clientAuthorization();
    try {
      const response = await request(options);
      return Promise.resolve(JSON.parse(response));
    } catch (err) {
      // Something different went wrong
      return Promise.reject(err);
    }
  }

  async refreshedRetryUser(options) {
    // Try again with new access token:
    await this.refreshAccessToken();
    try {
      const response = await request(options);
      return Promise.resolve(JSON.parse(response));
    } catch (err) {
      // Something different went wrong
      return Promise.reject(err);
    }
  }

  async refreshAccessToken() {
    try {
      const response = await request.post(`${this.OAuthURL}/api/token`, {
        form: {
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        },
        auth: {
          user: this.clientID,
          pass: this.clientSecret
        }
      });
      this.accessToken = JSON.parse(response).access_token;
      return Promise.resolve();
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }
}

/* Declare spotify client on runtime */
const spotifyClient = new SpotifyClient(
  process.env.SPOTIFY_ID,
  process.env.SPOTIFY_SECRET,
  ['playlist-modify-public'],
  `http://localhost:${process.env.PORT}/api/spotify/authorization`,
  process.env.SPOTIFY_LOCALE
);

module.exports.search = async ctx => {
  const { search } = ctx.query;
  if (!search) {
    ctx.throw(500, `Missing search query`);
  }
  try {
    const spotifyRes = await spotifyClient.search(search, 'track', 9);
    ctx.body = spotifyRes;
  } catch (err) {
    ctx.throw(500, err);
  }
};

module.exports.authorization = async ctx => {
  const { code } = ctx.query;
  if (code) {
    await spotifyClient.userAuthorization(code);
  }

  const authorizationURL = `${spotifyClient.OAuthURL}/authorize?response_type=code&client_id=${
    process.env.SPOTIFY_ID
  }&scope=${spotifyClient.scopes.join('%20')}&redirect_uri=${encodeURIComponent(
    spotifyClient.redirectURL
  )}`;
  ctx.body = { success: true, authorizationURL };
};

module.exports.token = async ctx => {
  if (!spotifyClient.refreshToken) {
    spotifyClient.refreshToken = process.env.SPOTIFY_REFRESHTOKEN;
  }

  try {
    await spotifyClient.refreshAccessToken();
    ctx.body = {success: true};
  } catch (err) {
    console.log(err)
    ctx.throw(500, 'Error refreshing code')
  }
};
