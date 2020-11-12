import React from 'react'
import ReactDOM from 'react-dom'

class AboutPage extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>Hello World</div>
    )
  }
}

// const About = ({users}) =>
//     <div>
//         <h1>Featured Players</h1>
//
//         {users.map(user =>
//             <p>
//
//             <a href={`/user/${user.username}/`}>
//                 {user.username}
//             </a>
//             </p>
//                     )}
//     </div>

ReactDOM.render(
  // gets the props that are passed in the template
  React.createElement(AboutPage, window.props),
  // a reference to the #react div that we render to
  window.react_mount,
)
