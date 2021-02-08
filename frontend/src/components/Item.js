import React from "react";

class Item extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        <h5>Item:</h5>
          {this.props.item.name}
      </div>
    )
  }
}

export default Item;

