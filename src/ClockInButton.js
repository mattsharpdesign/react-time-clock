import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';

class ClockInButton extends Component {
  state = {  }
  render() { 
    const { text } = this.props;
    return (
      <Button content={text} />
    );
  }
}
 
export default ClockInButton;