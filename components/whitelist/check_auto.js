import React from 'react';
import PropTypes from 'prop-types';

import Loading from 'components/common/loading'

import {withTranslate} from 'hocs/index'
import withWallet from 'hocs/wallet';
import message from 'components/common/message'
import { httpRequest } from 'helper/http';

import {EmojiSadIcon,EmojiHappyIcon} from '@heroicons/react/outline'


@withTranslate
class CheckWhitelist extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            is_fetching : false,
            is_fetched  : false,
            address     : '',
            result      : null
        }
        this.submitForm = ::this.submitForm
    }

    componentDidMount() {
        if (this.props.wallet) {
            this.submitForm();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.wallet !== this.props.wallet) {
            this.submitForm();
        }
    }

    async submitForm() {
        const {club_id,wallet} = this.props;

        if (!wallet || !wallet.address) {
            return;
        }

        this.setState({
            'is_fetching' : true,
            'is_fetched'  : false,
            'result'      : null
        })

        ///发起请求
        let request_result = await httpRequest({
            url : '/v1/contract/whitelist_check',
            method : 'GET',
            data : {
                'address' : wallet.address,
                'club_id' : club_id
            }
        })

        this.setState({
            'is_fetching' : false,
            'is_fetched'  : true,
            'result'      : request_result.data.is_whitelist
        })

    }

    render() {
        const {is_fetching,result,is_fetched} = this.state;
        const {wallet} = this.props;
        const {t} = this.props.i18n;

        if (!wallet) {
            return <div className='py-4 text-center bg-gray-100 flex items-center justify-center text-gray-500'>
                not connect yet
            </div>
        }


        return  <div className='py-4 '>
            {
                (is_fetching)
                ? <Loading />
                : null
            }
            {
                (is_fetched)
                ? <>
                    <div className="capitalize">
                    {
                        (result)
                        ? <span className='text-green-500 flex justify-start items-center font-bold '>
                            <EmojiHappyIcon className="icon-sm mr-2" />
                            {t('you are in whitelist')}
                        </span>
                        : <span className='text-gray-700 flex justify-start items-center font-bold'>
                            <EmojiSadIcon className="icon-sm mr-2" />
                            {t('you are not in whitelist')}
                        </span>
                    }
                    </div>
                    <div className='mt-2 text-sm text-gray-500'>
                        {wallet.address}
                    </div>
                </>
                : null
            }
            {/* <div>
                {
                    (result && address && result[address] !== undefined)
                    ? <div className='p-4 mt-4 bg-gray-100 text-bold text-base capitalize'>
                        {
                            (result[address])
                            ? <span className='text-green-500 flex justify-center items-center '>
                                <EmojiHappyIcon className="icon-sm mr-2" />
                                {t('you are in whitelist')}
                            </span>
                            : <span className='text-gray-700 flex justify-center items-center'>
                                <EmojiSadIcon className="icon-sm mr-2" />
                                {t('you are not in whitelist')}
                            </span>
                        }
                    </div>
                    : null
                }
            </div> */}
        </div>
    }

    
}


module.exports = CheckWhitelist


