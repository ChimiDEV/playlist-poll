import React, { Component } from 'react';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      uniqueCode: ''
    };
  }

  componentWillMount() {
    const {userName, uniqueCode} = this.state
    const buffer = new Buffer(`${userName}@${uniqueCode}`);
    const base64String = buffer.toString('base64');

    fetch('http://localhost:8080/api/songs', {
      headers:{
        // Just a local "key" for quick authorization handling local. NOT SECURE OK??
        'x-app-credentials': base64String
      }
    })
    .then(res => res.json())
    .then(data => console.log(data))
  }

  render() {
    return <div>Start Programming</div>;
  }
}
