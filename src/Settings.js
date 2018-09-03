import React, { Component } from 'react';
import { Segment, Header, List, Popup } from 'semantic-ui-react';
import moment from 'moment';

class Settings extends Component {
  state = {  }
  render() { 
    const { account } = this.props;
    return (
      <Segment>
        <Header>Settings</Header>
        <List relaxed>
          <List.Item>Pay week starts on:&emsp;<strong>{moment().day(account.weekStartsOn).format('dddd')}</strong></List.Item>
          <List.Item>
            Default unpaid break each day:&emsp;
            <Popup 
              trigger={<strong>{account.defaultUnpaidMinutes} minutes</strong>} 
              content='Subtracted from any shift over 4 hours. Can be changed in the approval queue.'
            />
          </List.Item>
        </List>
      </Segment>
    );
  }
}
 
export default Settings;