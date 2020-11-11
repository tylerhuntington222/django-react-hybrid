import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'

import axios from 'axios'
import DocumentTitle from 'react-document-title'

class App extends Component {
  onClick = e => {
    console.log('Sending a GET API Call !!!')
    axios
      .get('/api/')
      .then(res => {
        console.log(res)
      })
      .then(response => {
        console.log(JSON.stringify(response))
      })
  }

  render() {
    return (
      <div className="App">
        <DocumentTitle title="django-react-pac" />
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <button type="button" onClick={this.onClick}>
          Send API request
        </button>
      </div>
    )
  }
}

export default App
