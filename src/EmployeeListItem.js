import React, { Component } from 'react';
import { List, Image } from 'semantic-ui-react';

class EmployeeListItem extends Component {
  state = {  }
  render() { 
    const e = this.props.employee;
    
    return (
      <List.Item>
        <Image avatar src={e.profilePicUrl} size='tiny' />
        <List.Content>
          <List.Header as='h3'>{e.lastName}, {e.firstName}</List.Header>
          <List.Description>Status...</List.Description>
        </List.Content>
      </List.Item>
    );
  }
}
 
export default EmployeeListItem;