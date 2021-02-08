import React from 'react'
import ReactDOM from 'react-dom'

class Home extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="jumbotron my-5">
        <h1
          className="display-4"> Welcome
        </h1>
      <hr/>
        <p className="lead">This Django project template provides a flexible
          frontend for
          rendering templates and React components interchangebly.
        </p>
      </div>
    )
  }
}

ReactDOM.render(
  // gets the props that are passed in the template
  React.createElement(Home, window.props),
  // a reference to the #react div that we render to
  window.react_mount,
)
