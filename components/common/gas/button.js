import React from 'react';
import {connect} from 'react-redux'
import autobind from 'autobind-decorator';

import {setGasData} from 'redux/reducer/setting'
import GasIcon from 'public/img/icons/gas.svg';
import {getUnixtime} from 'helper/time'
import withDropdown from 'hocs/dropdown';
import Dropdown from 'rc-dropdown';
import withTranslate from 'hocs/translate';
import config from 'helper/config'
import BigNumber from "bignumber.js";
import {getAmountFromIntAmount} from 'helper/number'

@withTranslate
@withDropdown
class GasButton extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            show_modal  : false,
            is_fetching : false,
            is_fetched  : false,
            mint_gas_limit  : config.get('GAS.MINT')
        }
        this.getGas = ::this.getGas
        this.timer = null
    }

    componentDidMount() {
        // console.log('调用到DidMount')
        this.setGetGas();
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    // @autobind
    // estimateGasDeploy(network = 'kovan') {
    //     const {t} = this.props.i18n;
    //     let mane = new manestudio(t,network,'tst');
    //     let gas_data = mane.estimateGasDeploy();
    //     console.log('gas_data',gas_data)
    // }

    @autobind
    setGetGas() {

        // console.log('调用到setGetGas');

        let last_update_time = this.props.gas_data.get('last_update_time');
        let now_unixtime = getUnixtime();

        let timer = 60 * 2;

        let gap_timer = 0;
        if ((now_unixtime - last_update_time) >= timer) {
            // console.log('因为发现超时了，调用到getGAS')
            this.getGas();
            this.gap_timer = timer;
        }else {
            gap_timer = timer - (now_unixtime - last_update_time);
        }
        if (gap_timer == 0) {
            gap_timer = 120;
        }
        // console.log('gap_timer',gap_timer);
        if (!this.timer) {
            this.timer = setTimeout(()=>{
                this.setGetGas();
            },gap_timer*1000);
        }

    }


    async getGas() {

        // console.log('调用到getGas');

        this.setState({
            'is_fetching' : true,
        })

        let response = await fetch('https://ethgasstation.info/api/ethgasAPI.json')
        let result = await response.json();

        console.log('result',result)

        this.setState({
            'is_fetching' : false,
            'is_fetched'  : true
        })

        this.props.setGasData(result);

    }

    getGasEstimate(gas_price,gas_limit) {
        let gas_estimate = new BigNumber(gas_price).dividedBy(10).times(gas_limit);
        let gas_estimate_eth = getAmountFromIntAmount(gas_estimate,9);
        return gas_estimate_eth;
    }

    render() {

        const {gas_data,dropdown_visible} = this.props;
        const {mint_gas_limit} = this.state;
        const {t} = this.props.i18n;

        let mint_gas_estimate = this.getGasEstimate(gas_data.getIn(['data','average']),mint_gas_limit);

        // if (gas_data) {
        //     console.log('gas_data',gas_data.toJS())
        // }

        let content = <div className="block-menu w-64">
            {
                (gas_data.getIn(['data','fast']))
                ? <div className='gas-wrapper'>
                    <div className='gas-one text-red-500'>
                        <div className='l'>{t('fast')}</div>
                        <div className='r'>{gas_data.getIn(['data','fast']) / 10}</div>
                    </div>
                    <div className='gas-one text-blue-500' >
                        <div className='l'>{t('average')}</div>
                        <div className='r'>{gas_data.getIn(['data','average']) / 10}</div>

                    </div>
                    <div className='gas-one text-green-500'>
                        <div className='l'>{t('low')}</div>
                        <div className='r'>{gas_data.getIn(['data','safeLow']) / 10}</div>
                    </div>
                    <div className='border-t border-gray-200 my-4'/>
                    <div>
                        <div className='font-bold'>{t('Gas estimates')}</div>
                        <div className='gas-one '>
                            <div className='l'>{t('mint one')}</div>
                            <div className='r'>{parseFloat(mint_gas_estimate.toFixed(8))} ETH</div>
                        </div>
                        <div className='gas-one '>
                            <div className='l'>{t('mint two')}</div>
                            <div className='r'>{parseFloat(mint_gas_estimate.times(2).toFixed(8))} ETH</div>
                        </div>
                    </div>
                </div>
                : null
            }
        </div>

        return <Dropdown visible={dropdown_visible} overlay={content} 
            trigger="click"
            placement="bottomLeft" 
            onVisibleChange={this.props.toggleDropdown} >
            <button className='btn btn-ghost text-blue-500'>
                <GasIcon className="icon-xs"/>
                {
                    (gas_data && gas_data.getIn(['data','average'])) 
                    ? <span className='ml-2 text-base'>
                        {gas_data.getIn(['data','average']) / 10}
                    </span>
                    : null
                }
            </button>
        </Dropdown>
    }

    
}



const mapDispatchToProps = (dispatch) => {
    return {
        setGasData : (data) => {
            return dispatch(setGasData(data))
        },
    }
}
function mapStateToProps(state,ownProps) {
    return {
        'gas_data'      :  state.getIn(['setting','gas_data']),
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(GasButton);



