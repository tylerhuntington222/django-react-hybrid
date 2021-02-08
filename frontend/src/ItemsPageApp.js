import React from 'react'
import ReactDOM from 'react-dom'
import Item from './components/Item'

class ItemsPage extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      // <div>
      //  {this.props.items.map(item =>
      //   <Item item={item}/>
      //   )}
      //  </div>
      <div className={'my-3'}>
        <table className={'table'}>
          <th>
            Item
          </th>
          <th>
            Color
          </th>
          <th>
            Quantity
          </th>
          {this.props.items.map(item =>
            <tr>
              <td>{item.name}</td>
              <td>{item.color}</td>
              <td>{item.quantity}</td>
            </tr>
          )}
        </table>
      </div>
    )
  }
}


ReactDOM.render(
  // gets the props that are passed in the template
  React.createElement(ItemsPage, window.props),
  // a reference to the #react div that we render to
  window.react_mount,
)
