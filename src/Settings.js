import React, { Component } from 'react';
import { Segment, Header, List, Popup } from 'semantic-ui-react';
import moment from 'moment';
import { inject, observer } from 'mobx-react';

class Settings extends Component {
  state = {  }
  render() { 
    const { user, account } = this.props.store;
    return (
      <Segment>
        <Header>Settings</Header>
        <List relaxed>
          <List.Item>App version:&nbsp;<strong>{this.props.appVersion}</strong></List.Item>
          <List.Item>Logged in as:&nbsp;<strong>{user.email}</strong></List.Item>
          <List.Item>Account:&nbsp;<strong>{account.name} ({account.id})</strong></List.Item>
          <List.Item>Role:&nbsp;<strong>{user.role}</strong></List.Item>
          <List.Item>Pay week starts on:&nbsp;<strong>{moment().day(account.weekStartsOn).format('dddd')}</strong></List.Item>
          <List.Item>
            Default unpaid break each day:&nbsp;
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
 
export default inject('store', 'appVersion')(observer(Settings));