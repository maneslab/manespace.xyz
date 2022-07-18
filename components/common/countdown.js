import React from 'react';
import Countdown from 'react-countdown';
import { formatOverflowUnixtime } from 'helper/time';
import withTranslate from 'hocs/translate';

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
  
@withTranslate
class CountDown extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {

        let {unixtime} = this.props;
        const {t} = this.props.i18n;

        unixtime = formatOverflowUnixtime(unixtime);

        if (!unixtime) {
            return <div>
                {t('(no end time)')}
            </div>
        }

        return (
            <Countdown
                date={unixtime*1000}
                renderer={renderer}
            />
        );
    }
}

module.exports = CountDown
