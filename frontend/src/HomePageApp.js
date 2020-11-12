import React from 'react'
import ReactDOM from 'react-dom'

class Home extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>Hello World</div>
    )
  }
}

ReactDOM.render(
    React.createElement(Home, window.props),    // gets the props that are passed in the template
    window.react_mount,                                // a reference to the #react div that we render to
)
