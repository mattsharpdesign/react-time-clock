import React, { Component } from 'react';
import { List, Image } from 'semantic-ui-react';
// import { inject, observer } from 'mobx-react';
import placeholder from '../profile_placeholder.png';

class EmployeeListItem extends Component {
  state = {  }
  render() { 
    const e = this.props.employee;
    const profilePicUrl = e.profilePicUrl || placeholder;
    // const status = this.props.store.getEmployeeStatus(e);
    const status = 'Not here';
    const classes = {
      'Here': 'here',
      'Not here' : 'not-here',
      'Coming back': 'coming-back',
    }
    return (
      <List.Item title={e.id} onClick={() => this.props.onSelect(e)}>
        <Image avatar src={profilePicUrl} size='tiny' />
        <List.Content>
          <List.Header as='h3'>{e.lastName}, {e.firstName}</List.Header>
          {/* <List.Description className={classes[status]}>{status}</List.Description> */}
        </List.Content>
      </List.Item>
    );
  }
}
 
// export default inject('store')(observer(EmployeeListItem));
export default EmployeeListItem;