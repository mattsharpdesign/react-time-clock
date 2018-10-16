import React, { Component } from 'react';
import { timestampToHoursAndMinutes } from '../date-functions';
import { Icon } from 'semantic-ui-react';

class ApprovalQueueShiftEventCell extends Component {
  state = {  }
  render() {
    const { event } = this.props; 
    return (
      <td>
        {timestampToHoursAndMinutes(event.timestamp)}
        &nbsp;<Icon name='camera' />
        {event.comment &&
          <Icon name='info circle' title={event.comment} />
        }
      </td>
    );
  }
}
 
export default ApprovalQueueShiftEventCell;