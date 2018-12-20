import { EventEmitter } from 'events';
import React, { Component } from 'react';
import {NotificationContainer} from 'react-notifications';
import axios from 'axios';

import '../assets/style.css';
import 'react-notifications/lib/notifications.css';

import Header from './Header';
import SpotifyResultContainer from './SpotifyResultContainer';
import PlaylistPollContainer from './PlaylistPollContainer';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Silberfest 2018 👌',
      username: 'Alex',
      uniqueCode: '',
      searchTerm: '',
      searchResults: [],
      isLoggedIn: false
    };
    this.emitter = new EventEmitter();
    this.onUsernameChange = this.onUsernameChange.bind(this);
    this.onCodeChange = this.onCodeChange.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchKeyPress = this.onSearchKeyPress.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.spotifySearch = this.spotifySearch.bind(this);
  }

  onUsernameChange(e) {
    this.setState({ username: e.target.value });
  }

  onCodeChange(e) {
    this.setState({ uniqueCode: e.target.value });
  }

  onSearchChange(e) {
    this.setState({ searchTerm: e.target.value });
  }

  onSearchKeyPress(e) {
    if (e.charCode !== 13) {
      return;
    }
    this.spotifySearch();
  }

  async spotifySearch() {
    const { searchTerm, isLoggedIn } = this.state;
    const sessionAuthDetails = sessionStorage.getItem('playlist-auth-token');
    if (!isLoggedIn || !sessionAuthDetails) {
      return;
    }

    const { token } = JSON.parse(sessionAuthDetails);
    try {
      const res = await axios.get(`http://localhost:8080/api/spotify?search=${searchTerm}`, {
        headers: { 'x-app-credentials': token }
      });
      console.log(res.data.tracks)
      this.setState({searchResults: res.data.tracks.items});
    } catch (err) {
      console.log(err.response);
    }
  }

  async login() {
    const { username, uniqueCode: code } = this.state;
    if (!username || !code) {
      return;
    }
    try {
      const res = await axios.post('http://localhost:8080/api/login', { username, code });
      const { success, token } = res.data;
      if (success) {
        this.setState({ isLoggedIn: true });
        sessionStorage.setItem('playlist-auth-token', JSON.stringify({ username, code, token }));
        this.emitter.emit('updateData');
        console.log('Logged in');
      }
    } catch (err) {
      alert('Wrong Code');
      console.log(err);
    }
  }

  logout() {
    this.setState({ isLoggedIn: false, uniqueCode: '', username: 'Alex' });
    sessionStorage.removeItem('playlist-auth-token');
    console.log('Logged out');
  }

  componentWillMount() {
    const sessionAuthDetails = sessionStorage.getItem('playlist-auth-token');
    if (!sessionAuthDetails) {
      return;
    }

    const { username, code } = JSON.parse(sessionAuthDetails);
    this.setState({ username, uniqueCode: code, isLoggedIn: true });
  }

  render() {
    const { title, username, uniqueCode, isLoggedIn, searchTerm, searchResults } = this.state;
    return (
      <div>
        <Header
          title={title}
          onUsernameChange={this.onUsernameChange}
          onCodeChange={this.onCodeChange}
          username={username}
          code={uniqueCode}
          login={this.login}
          logout={this.logout}
          isLoggedIn={isLoggedIn}
        />
        <div className="spotify-search-container">
          <input
            disabled={isLoggedIn ? false : true}
            onKeyPress={this.onSearchKeyPress}
            className="input-underline input-spotify-search"
            type="text"
            value={searchTerm}
            onChange={this.onSearchChange}
            placeholder={isLoggedIn ? 'Durchsuche Spotify' : 'Um zu suchen, logge dich zuerst ein'}
          />
          <span className="focus-border" />
        </div>
        <div className="btn-spotify-search">
          <a
            href="#"
            className={`btn green ${isLoggedIn ? '' : 'disabled'}`}
            onClick={this.spotifySearch}
          >
            Search
          </a>
        </div>
        <div className="body-container">
          <SpotifyResultContainer searchResults={searchResults} emitter={this.emitter}/>
          <PlaylistPollContainer isLoggedIn={isLoggedIn} emitter={this.emitter}/>
        </div>
        <NotificationContainer />
      </div>
    );
  }
}
