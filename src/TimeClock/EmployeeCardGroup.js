import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import EmployeeCard from './EmployeeCard';

class EmployeeCardGroup extends Component {
  state = {  }
  render() { 
    const { employees, onSelect, visible } = this.props;
    if (!visible) return null;
    return (
      <Card.Group style={{ paddingTop: '2em' }}>
        {employees.map(e => (
          <EmployeeCard key={e.id} employee={e} onSelect={onSelect} />
        ))}
      </Card.Group>
    );
  }
}
 
export default EmployeeCardGroup;