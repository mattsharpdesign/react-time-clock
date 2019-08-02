import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import EmployeeCard from './EmployeeCard';

class EmployeeCardGroup extends Component {
  state = {  }
  render() { 
    const { employees, onSelect, visible, filter } = this.props;
    if (!visible) return null;
    return (
      <Card.Group style={{ paddingTop: '2em' }}>
        {employees.map(e => {
          if (filter === 'here' && e.status !== 1) return null
          if (filter === 'not here' && e.status === 1) return null
          return <EmployeeCard key={e.id} employee={e} onSelect={onSelect} />
        })}
      </Card.Group>
    );
  }
}
 
export default EmployeeCardGroup;