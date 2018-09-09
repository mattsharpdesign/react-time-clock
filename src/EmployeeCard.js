import React, { Component } from 'react';
import { Card, Image } from 'semantic-ui-react';

class EmployeeCard extends Component {
  state = {  }
  render() { 
    const { employee, onSelect } = this.props;
    return (
      <Card onClick={() => onSelect(employee)}>
        <Image src={employee.profilePicUrl} />
        <Card.Content>
          <Card.Header>{employee.lastName}, {employee.firstName}</Card.Header>
          <Card.Meta>Status...</Card.Meta>
        </Card.Content>
      </Card>
    );
  }
}
 
export default EmployeeCard;