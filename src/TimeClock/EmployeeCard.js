import React, { Component } from 'react';
import { Card, Image } from 'semantic-ui-react';
import placeholder from '../profile_placeholder.png';
// import { inject, observer } from 'mobx-react';

const mapStatusToString = {
  0: 'Not here',
  1: 'Here',
  2: 'Temporarily not working'
}

const mapStatusToColor = {
  0: 'grey',
  1: 'green',
  2: 'orange'
}

class EmployeeCard extends Component {
  state = {  }
  render() { 
    const { employee, onSelect } = this.props;
    const profilePicUrl = employee.profilePicUrl || placeholder;
    return (
      <Card onClick={() => onSelect(employee)} color={mapStatusToColor[employee.status]}>
        <Image src={profilePicUrl} />
        <Card.Content>
          <Card.Header>{employee.lastName}, {employee.firstName}</Card.Header>
          <Card.Meta>{mapStatusToString[employee.status]}</Card.Meta>
        </Card.Content>
      </Card>
    );
  }
}
 
// export default inject('store')(observer(EmployeeCard));
export default EmployeeCard;