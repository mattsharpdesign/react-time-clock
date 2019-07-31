import React, { Component } from 'react';
import { Segment, Header, List, Popup } from 'semantic-ui-react';
import moment from 'moment';
import packageJson from '../../package.json';
// import { inject, observer } from 'mobx-react';

class Settings extends Component {
  state = {  }
  render() { 
    const { user, accountSettings } = this.props;
    return (
      <Segment>
        <Header>Settings</Header>
        <List relaxed>
          <List.Item>App version:&nbsp;<strong>{packageJson.version}</strong></List.Item>
          <List.Item>Logged in as:&nbsp;<strong>{user.email}</strong></List.Item>
          <List.Item>Account:&nbsp;<strong>{accountSettings.name}</strong></List.Item>
          <List.Item>Role:&nbsp;<strong>{user.role}</strong></List.Item>
          <List.Item>Pay week starts on:&nbsp;<strong>{moment().day(accountSettings.weekStartsOn).format('dddd')}</strong></List.Item>
          <List.Item>
            Default unpaid break each day:&nbsp;
            <Popup 
              trigger={<strong>{accountSettings.defaultUnpaidMinutes} minutes</strong>} 
              content='Subtracted from any shift over 4 hours. Can be changed in the approval queue.'
            />
          </List.Item>
        </List>
      </Segment>
    );
  }
}
 
// export default inject('store', 'appVersion')(observer(Settings));
export default Settings;