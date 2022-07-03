import React from 'react';
import PropTypes from 'prop-types';

import Button from 'components/common/button'

import {withTranslate} from 'hocs/index'
import withWallet from 'hocs/wallet';
import message from 'components/common/message'
import { httpRequest } from 'helper/http';

import {EmojiSadIcon,EmojiHappyIcon} from '@heroicons/react/outline'


@withWallet
@withTranslate
class CheckWhitelist extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            is_fetching : false,
            address     : '',
            result      : {}
        }
        this.submitForm = ::this.submitForm
    }

    async submitForm() {
        const {address} = this.state;
        const {club_id} = this.props;

        let patten = /0x[a-fA-F0-9]{40}/;
        if (!patten.test(address) || address.length !== 42) {
            message.error('is not eth wallet address');
            return;
        }

        this.setState({
            'is_fetching' : true
        })

        ///发起请求
        let request_result = await httpRequest({
            url : '/v1/contract/whitelist_check',
            method : 'GET',
            data : {
                'address' : address,
                'club_id' : club_id
            }
        })

        const {result} = this.state;

        if (request_result.data) {
            result[address] = true
        }else {
            result[address] = false
        }

        this.setState({
            'is_fetching' : false,
            'result'      : result
        })

    }

    render() {
        const {is_fetching,address,result} = this.state;
        const {t} = this.props.i18n;

        console.log('test0address-result',result[address])

        return  <div className='flex justify-center flex-col'>
            <div className="flex justify-start items-end">
                <input className='input-box' value={address} onChange={(e)=>{
                    this.setState({'address':e.target.value})
                }} label={t("address")} placeholder={t("eth wallet address")} />
                <Button loading={is_fetching} className="btn btn-primary btn-inline-form ml-4" onClick={this.submitForm}>{t("check")}</Button>
            </div>
            <div>
                {
                    (result && address && result[address] !== undefined)
                    ? <div className='mt-4 text-bold text-base capitalize'>
                        {
                            (result[address])
                            ? <span className='text-green-500 flex justify-start items-center '>
                                <EmojiHappyIcon className="icon-sm mr-2" />
                                {t('this address is in whitelist')}
                            </span>
                            : <span className='text-gray-700 flex justify-start items-center'>
                                <EmojiSadIcon className="icon-sm mr-2" />
                                {t('this address is not in whitelist')}
                            </span>
                        }
                    </div>
                    : null
                }
            </div>
        </div>
    }

    
}


module.exports = CheckWhitelist


