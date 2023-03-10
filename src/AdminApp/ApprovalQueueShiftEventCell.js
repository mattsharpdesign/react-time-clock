import React, { Component } from 'react';
import { timestampToHoursAndMinutes } from '../date-functions';
import { Icon, Popup, Image } from 'semantic-ui-react';
import moment from 'moment';

class ApprovalQueueShiftEventCell extends Component {
  state = {  }
  render() {
    const { event } = this.props; 
    return (
      <td>
        <span title={moment(event.timestamp.toDate()).format('DD/MM/YYYY HH:mm:ss')}>{timestampToHoursAndMinutes(event.timestamp)}</span>
        &nbsp;
        <Popup trigger={<Icon name={event.screenshotData ? 'camera' : 'warning sign'} />}>
          {event.screenshotData &&
            <Image src={event.screenshotData} alt='' />
          }
          {!event.screenshotData &&
            <span>No screenshot data found</span>
          }
        </Popup>
        {event.comment &&
          <Icon name='info circle' title={event.comment} />
        }
      </td>
    );
  }
}
 
export default ApprovalQueueShiftEventCell;