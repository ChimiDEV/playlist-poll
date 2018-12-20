import React, { Component } from 'react';
import { NotificationManager } from 'react-notifications';
import axios from 'axios';

export default class PlaylistPollContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tracks: []
    };
    this.renderPoll = this.renderPoll.bind(this);
    this.retrievePoll = this.retrievePoll.bind(this);
    this.vote = this.vote.bind(this);
  }

  componentWillMount() {
    this.retrievePoll();
    this.props.emitter.on('updateData', this.retrievePoll);
  }

  async retrievePoll() {
    try {
      const res = await axios.get('http://localhost:8080/api/songs');
      const tracks = res.data.sort((prev, curr) => this.calculateVotes(prev.votes) < this.calculateVotes(curr.votes));
      console.log(tracks);
      this.setState({ tracks: res.data });
    } catch (err) {
      NotificationManager.error('Interner Fehler - Hau Tim 😋', 'Fehler');
    }
  }

  calculateVotes(votes) {
    let voteCount = 0;
    votes.forEach(vote => {
      if (vote.upvote) {
        voteCount += 1;
      } else {
        voteCount -= 1;
      }
    });
    return voteCount;
  }

  async vote(id, upvote) {
    if (!this.props.isLoggedIn) {
      return;
    }
    const sessionAuthDetails = sessionStorage.getItem('playlist-auth-token');
    if (!sessionAuthDetails) {
      return;
    }
    const { username: voter, token } = JSON.parse(sessionAuthDetails);
    const vote = {
      voter,
      upvote
    };

    try {
      await axios.put(`http://localhost:8080/api/songs/${id}`, vote, {
        headers: { 'x-app-credentials': token }
      });
      this.retrievePoll();
    } catch (err) {
      console.log(err.response);
    }
  }

  renderPoll(result) {
    const { isLoggedIn } = this.props;
    const { _id, song, votes, creator } = result;
    let albumTitle = song.albumTitle;
    if (albumTitle.length >= 25) {
      albumTitle = `${albumTitle.slice(0, 22)}...`;
    }

    let title = song.title;
    if (title.length >= 25) {
      title = `${title.slice(0, 22)}...`;
    }

    // Determine if vote button is active
    let isUpActive = true;
    let isDownActive = true;
    const sessionAuthDetails = sessionStorage.getItem('playlist-auth-token');
    let username = '';
    if (sessionAuthDetails) {
      username = JSON.parse(sessionAuthDetails).username;
    }
    votes.forEach(vote => {
      if (vote.voter === username) {
        isUpActive = !vote.upvote;
        isDownActive = vote.upvote;
      }
    });

    return (
      <div className="poll">
        <div className="poll-thumbnail" onClick={() => window.open(song.playURL)}>
          <div className="play-button" />
          <img src={song.img} />
        </div>
        <div className="poll-data">
          <div>
            <span className="poll-artist">{song.artist} | </span>
            <span title={song.albumTitle} className="poll-album">
              {albumTitle}
            </span>
          </div>
          <div title={song.title} className="poll-title">
            {title}
          </div>
          <div className="poll-creator">Song hinzugefügt von {creator}</div>
        </div>

        <div className="poll-vote-container">
          <div
            className={`up ${isLoggedIn && isUpActive ? '' : 'disabled'}`}
            onClick={() => this.vote(_id, true)}
          >
            &#9650;
          </div>
          <div className={`poll-vote-counter ${isLoggedIn ? '' : 'disabled'}`}>
            {this.calculateVotes(votes)}
          </div>
          <div
            className={`down ${isLoggedIn && isDownActive ? '' : 'disabled'}`}
            onClick={() => this.vote(_id, false)}
          >
            &#9660;
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { tracks } = this.state;
    return (
      <div>
        <div className="body-header">Vorgeschlagene Lieder:</div>
        <div className="poll-container">{tracks.map(this.renderPoll)}</div>
      </div>
    );
  }
}
