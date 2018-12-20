import React, { Component } from 'react';
import {NotificationManager} from 'react-notifications';
import axios from 'axios';

export default class SpotifyResultContainer extends Component {
  constructor(props) {
    super(props);
    this.renderSpotifyResult = this.renderSpotifyResult.bind(this);
  }

  async postNewSong(result) {
    const sessionAuthDetails = sessionStorage.getItem('playlist-auth-token');
    if (!sessionAuthDetails) {
      return;
    }

    const { username: voter, token } = JSON.parse(sessionAuthDetails);
    const {
      id: songID,
      name: title,
      album,
      artists,
      external_urls,
      duration_ms: duration
    } = result;
    const song = {
      title,
      duration,
      artist: artists[0].name,
      albumTitle: album.name,
      img: album.images[2].url,
      playURL: external_urls.spotify
    };
    try {
      const res = await axios.post(
        'http://localhost:8080/api/songs',
        {
          songID,
          song,
          votes: [{ voter, upvote: true }],
          creator: voter
        },
        { headers: { 'x-app-credentials': token } }
      );
      this.props.emitter.emit('updateData');
      if (res.status === 201) {
        NotificationManager.info('Dieses Lied wurde bereits hinzugefügt. Es bekommt ein Upvote von dir 🔥', 'Playlist Poll');
      } else {
        NotificationManager.success('Dein Lied wurde hinzugefügt 🔥', 'Playlist Poll');
      }
    } catch (err) {
      if(err.response.status === 406) {
        NotificationManager.error('Dieses Lied wurde bereits hinzugefügt und von dir gevoted.', 'Fehler');
        this.props.emitter.emit('updateData');
      } else {
        NotificationManager.error('Interner Fehler - Hau Tim 😋', 'Fehler');
      }
    }
  }

  renderSpotifyResult(result) {
    const { name, album, artists, external_urls } = result;
    let albumTitle = album.name;
    if (albumTitle.length >= 25) {
      albumTitle = `${albumTitle.slice(0, 22)}...`;
    }

    let title = name;
    if (title.length >= 25) {
      title = `${title.slice(0, 22)}...`;
    }

    return (
      <div className="spotify-result">
        <div
          className="spotify-result-thumbnail"
          onClick={() => window.open(external_urls.spotify)}
        >
          <div className="play-button" />
          <img src={album.images[2].url} />
        </div>
        <div className="spotify-result-data">
          <div>
            <span className="spotify-result-artist">{artists[0].name} | </span>
            <span title={album.name} className="spotify-result-album">
              {albumTitle}
            </span>
          </div>
          <div title={name} className="spotify-result-title">
            {title}
          </div>
        </div>
        <div className="spotify-result-add" onClick={() => this.postNewSong(result)}>
          Zur Playlist hinzufügen
        </div>
      </div>
    );
  }

  render() {
    const { searchResults } = this.props;
    return (
      <div>
        <div className="body-header">Spotify Results:</div>
        <div className="spotify-results-container">
          {searchResults.map(this.renderSpotifyResult)}
        </div>
      </div>
    );
  }
}
