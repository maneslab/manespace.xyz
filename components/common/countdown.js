import React from 'react';
import Countdown from 'react-countdown';

const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <span>-</span>;
    } else {

        let dw = 'day'
        if (days > 1) {
            dw = 'days'
        }
      // Render a countdown
      return <span>{days} {dw} , {hours}:{minutes}:{seconds}</span>;
    }
  };
  

class CountDown extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {

        const {unixtime} = this.props;
        return (
            <Countdown
                date={unixtime*1000}
                renderer={renderer}
            />
        );
    }
}

module.exports = CountDown
