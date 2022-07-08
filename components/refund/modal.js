import React from 'react';
import PropTypes from 'prop-types';

import { connect } from "react-redux";

import Modal from 'components/common/modal'
import Button from 'components/common/button'
import Input from 'components/form/field'
import PrefixInput from 'components/form/prefix_input'
import FormObserver from 'components/form/observer';

import ProjectTypeSelect from 'components/form/mane/project_type_select'

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {addClub} from 'redux/reducer/club'

import {withTranslate} from 'hocs/index'

import { withRouter } from 'next/router';

import withWallet from 'hocs/wallet';
import autobind from 'autobind-decorator';


@withRouter
@withWallet
@withTranslate
class RefundModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            is_adding : false,
        }
    }

    @autobind
    submitForm(values) {
        console.log('debug03,values',values)

        this.setState({
            'is_adding' : true
        });

        var that = this;
        this.props.addClub(values).then(data=>{
            console.log('result',data);
            if (data.status == 'success') {
                that.setState({
                    'is_adding' : false
                })
                ///URL跳转
                this.props.router.push('/project/'+data.data.id);
            }else {
                Object.keys(data.messages).map(key=>{
                    this.formRef.current.setFieldError(key,data.messages[key].join(','));
                })
            }
        }).catch(error=>{
            that.setState({
                'is_adding' : false
            })
        })
    }


    render() {
        const {project_type,is_adding} = this.state;
        const {visible,deposit_data} = this.props;
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
                <div className='mb-4'>
                    This action cannot be undone. This will permanently remove this NFT from your wallet and then refund your money.
                </div>
                <div>
                    Please type  "refund"  to confirm.
                </div>
            </div>
            <div className='mb-4'>
                <input className='input-box'/>
            </div>
            <div className='flex justify-end'>
                <button className='btn btn-error'>confirm refund</button>
            </div>

        </Modal>
    }

    
}
RefundModal.propTypes = {
    visible     : PropTypes.bool,
    closeModal  : PropTypes.func,
};
  


module.exports = RefundModal


