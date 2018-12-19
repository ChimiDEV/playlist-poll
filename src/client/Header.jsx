import React, { Component } from 'react';

export default class Header extends Component {
  constructor(props) {
    super(props);

    this.renderLogin = this.renderLogin.bind(this);
    this.renderWelcome = this.renderWelcome.bind(this);
  }

  renderLogin() {
    const { username, code, onUsernameChange, onCodeChange, login } = this.props;
    return (
      <div className="header-login">
        <div className="header-username">
          <span className="custom-dropdown small">
            <select value={username} onChange={onUsernameChange}>
              <option>Alex</option>
              <option>Dani</option>
              <option>Heidi</option>
              <option>Jannik</option>
              <option>Marlen</option>
              <option>Mäule</option>
              <option>Pakku</option>
              <option>Sarah</option>
              <option>Tim</option>
              <option>Udo</option>
            </select>
          </span>
        </div>

        <div className="header-code">
          <div className="input-container">
            <input
              className="input-underline"
              type="text"
              value={code}
              onChange={onCodeChange}
              placeholder="Dein Anmeldecode"
            />
            <span className="focus-border" />
          </div>
        </div>

        <div className="log-button">
          <div>
            <a href="#" className="btn green" onClick={login}>
              Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  renderWelcome() {
    const { username, logout } = this.props;

    return (
      <div className="header-welcome">
        Eingeloggt als <span className="header-welcome-username">{username}</span>
        <div className="log-button">
          <div>
            <a href="#" className="btn green" onClick={logout}>
              Logout
            </a>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { title, isLoggedIn } = this.props;
    return (
      <div className="header">
        <div className="header-title">Playlist-Poll: {title}</div>
        {isLoggedIn ? this.renderWelcome() : this.renderLogin()}
      </div>
    );
  }
}
