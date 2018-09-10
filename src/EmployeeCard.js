import React, { Component } from 'react';
import { Card, Image } from 'semantic-ui-react';
import placeholder from './profile_placeholder.png';
import { inject, observer } from 'mobx-react';

class EmployeeCard extends Component {
  state = {  }
  render() { 
    const { employee, onSelect } = this.props;
    const profilePicUrl = employee.profilePicUrl || placeholder;
    return (
      <Card onClick={() => onSelect(employee)}>
        <Image src={profilePicUrl} />
        <Card.Content>
          <Card.Header>{employee.lastName}, {employee.firstName}</Card.Header>
          <Card.Meta>{this.props.store.getEmployeeStatus(employee)}</Card.Meta>
        </Card.Content>
      </Card>
    );
  }
}
 
export default inject('store')(observer(EmployeeCard));