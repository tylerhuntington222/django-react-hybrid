import React from 'react'
import ReactDOM from 'react-dom'
import Person from './components/Person'

class AboutPage extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
    <div>
        {this.props.users.map(user =>
          <Person user={user}/>
                    )}
    </div>
    )
  }
}


ReactDOM.render(
  // gets the props that are passed in the template
  React.createElement(AboutPage, window.props),
  // a reference to the #react div that we render to
  window.react_mount,
)
