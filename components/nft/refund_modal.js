import React from 'react';
import PropTypes from 'prop-types';


import Modal from 'components/common/modal'
import Button from 'components/common/button'

import {withTranslate} from 'hocs/index'

import autobind from 'autobind-decorator';
import { ExclamationIcon } from '@heroicons/react/outline';
import message from 'components/common/message'
import manenft from 'helper/web3/manenft';

@withTranslate
class RefundModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            is_refunding : false,
            value : ""
        }
    }

    @autobind
    async refund() {

        const {t} = this.props.i18n;
        const {contract_address,address,nft_id} = this.props;

        if (this.state.value != 'refund') {
            message.error(t('please type "refund" to confirm'));
            return
        }

        this.setState({
            'is_refunding' : true
        });


        let manenft_interface = new manenft(contract_address,t);
        // manenft_interface.contract.refund(nft_id)

        var that = this;

        await manenft_interface.request({
            'text' : {
                'loading' : t('refunding'),
                'sent'    : t('refund tx sent'),
                'success' : t('refund tx successful'),
            },
            'func' : {
                'send_tx' : async () => {
                    let tx_in = await  manenft_interface.contract.refund(nft_id);
                    console.log('tx is send',tx_in)
                    return tx_in;
                },
                'before_send_tx' : () => {
                    that.setState({
                        is_refunding : true,
                    })
                },
                'finish_tx' : () => {
                    that.setState({
                        is_refunding : false,
                    })
                },
                'after_finish_tx' : () => {
                    message.success(t('refund NFT success'));
                    this.props.refreshList();
                    // console.log('after_finish_tx');
                    // this.getUserSafeBox(this.props.login_user.get('wallet_address'));
                },
                'error_tx' : () => {
                    that.setState({
                        is_refunding : false,
                    })
                }
            } 
        })


    }


    render() {
        const {value,is_refunding} = this.state;
        const {visible,nft_id} = this.props;
        const {t} = this.props.i18n;

        if (!visible) {
            return null;
        }


        return  <Modal
            width={650}
            title={null}
            visible={visible} 
            footer={null}
            onClose={this.props.closeModal}>

            <h2 className='modal-title'>{t('refund')}</h2>

            <div className='border-t border-gray-100 my-4' />
            <div className='mb-4'>
                {t('refund-notice-info')}
            </div>

            <div class="alert alert-warning my-4">
                <div>
                <ExclamationIcon class="stroke-current flex-shrink-0 h-6 w-6" />
                <span>{t("Refund NFT ID")} : {nft_id}</span>
                </div>
            </div>

            <div className='mb-4'>
                {t('Please type  "refund"  to confirm')}
            </div>

            <div className='mb-4'>
                <input value={value} onChange={(e)=>{
                    this.setState({
                        'value' : e.target.value
                    })
                }} className='input-box' placeholder={t('Please type  "refund"  to confirm')}/>
            </div>

            <div className='flex justify-end'>
                <Button loading={this.state.is_refunding} className='btn btn-error' onClick={this.refund}>{t('refund')}</Button>
            </div>

        </Modal>
    }

    
}
RefundModal.propTypes = {
    visible     : PropTypes.bool,
    closeModal  : PropTypes.func,
};
  


module.exports = RefundModal


