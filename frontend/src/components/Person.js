import React from "react";
import ReactDOM from "react-dom";

class Person extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        <h5>Person:</h5>
        <a href={`/user/${this.props.user.username}/`}>
          {this.props.user.username}
        </a>
      </div>
    )
  }
}

export default Person;

