import React, { Component } from 'react';

class UnfinishedShifts extends Component {
  state = {  }
  render() {
    const { shifts } = this.props; 
    return (
      <table>
        <tbody>
          {shifts.map(s => (
            <tr key={s.id}>
              <td>{s.employee.firstName}</td>
              <td>{s.startedAt.toDate().toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
 
export default UnfinishedShifts;