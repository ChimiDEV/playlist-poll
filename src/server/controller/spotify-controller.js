const request = require('request-promise-native');

class SpotifyClient {
  constructor(clientID, clientSecret, locale) {
    this.clientID = clientID;
    this.clientSecret = clientSecret;
    this.locale = locale;
    this.accessToken = '';
    this.baseURL = 'https://api.spotify.com/v1';
    this.OAuthURL = 'https://accounts.spotify.com/api';
    this.clientAuthorization();
  }

  async clientAuthorization() {
    // 1. Have your application request authorization
    // https://developer.spotify.com/documentation/general/guides/authorization-guide/#client-credentials-flow
    try {
      const response = await request.post(`${this.OAuthURL}/token`, {
        form: {
          grant_type: 'client_credentials'
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

  async search(query, type, limit) {
    const url = `${this.baseURL}/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(
      type
    )}&market=${this.locale}&limit=${limit}`;
    try {
      const response = await request.get(url, {
        auth: {
          bearer: this.accessToken
        }
      });
      return Promise.resolve(JSON.parse(response));
    } catch (err) {
      return this.refreshRetry(url);
    }
  }

  async refreshRetry(url) {
    // Try again with new access token:
    await this.clientAuthorization();
    try {
      const response = await request.get(url, {
        auth: {
          bearer: this.accessToken
        }
      });
      return Promise.resolve(JSON.parse(response));
    } catch (err) {
      // Something different went wrong
      return Promise.reject(err);
    }
  }
}

/* Declare spotify client on runtime */
const spotifyClient = new SpotifyClient(
  process.env.SPOTIFY_ID,
  process.env.SPOTIFY_SECRET,
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
