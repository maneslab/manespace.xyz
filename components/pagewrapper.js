import React from 'react';
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'

import classNames from 'classnames';
import LanguageBtn from 'components/language/btn'

import Head from 'next/head'
import Link from 'next/link'
import ConnectWalletButton from 'components/wallet/connect_button'
import GasButton from 'components/common/gas/button'
import Footer from 'components/layout/footer'

import { denormalize } from 'normalizr';
import { userSchema } from 'redux/schema/index'
import { initApp,setSlider,setGlobalModal } from 'redux/reducer/setting'
import {withTranslate} from 'hocs/index'

import DarkmodeSwitch from './common/darkmode_switch';

import config from 'helper/config'

@withTranslate
class PageWrapper extends React.Component {


    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
        //initpage
        this.initPage();
    }



    @autobind
    initPage() {
        this.props.initApp();
    }

    @autobind
    toggleSider() {
        const {slider} = this.props;
        this.props.setSlider(!slider)
    }


    render() {

        const {t} = this.props.i18n;
        const {theme,wapperClassName} = this.props;

        let manestudio_url = config.get('MANASTUDIO_WEBSITE');

        return (
            <div className={classNames("fullpage-container pt-16",{"blue":(theme == 'blue')})}>
                <Head>
                    <title>{config.get('NAME')}</title>
                    <link href="/img/favicon.png" rel="icon" type="image/x-icon" />
                </Head>
                <div>

                    <div className='header-bg dark:bg-[#22252b] mb-8 fixed w-full top-0 shadow-sm'>
                        <div className="flex justify-between h-16 w-full max-w-screen-xl mx-auto">

                            <div className='flex justify-start'>

                                <Link href="/">
                                    <a className="logo">
                                        Mane<span className="text-primary">SPACE</span>
                                    </a>
                                </Link>

                                <div className='main-menu ml-4'>
                                    <a className='font-bold capitalize ml-2' href={manestudio_url} target="_blank">{t('create project')}</a>
                                </div>

                            </div>
                            

                            <div className='flex justify-end items-center'>

                                <div className='mr-4 dark-switch'>
                                    <DarkmodeSwitch />
                                </div>

                                <GasButton />

                                <LanguageBtn />

                                <ConnectWalletButton />

                            </div>
                        </div>
                    </div>
                    <div className="h-screen w-screen overflow-y-scroll pb-16">
                        <div className={(wapperClassName) ? wapperClassName : "py-4"}>
                            {this.props.children}
                        </div>
                        <Footer />
                    </div>


                </div>
            </div>
        );
    }
}


const mapDispatchToProps = (dispatch) => {
    return {
        setSlider : (data) => {
            return dispatch(setSlider(data))
        },
        setGlobalModal : (payload) => {
            return dispatch(setGlobalModal(payload));
        },
        initApp : () => {
            return dispatch(initApp());
        },
    }
}
function mapStateToProps(state,ownProps) {

    let entities = state.get('entities');
    ///注册成功

    let login_user_id = state.getIn(['setting','login_user']);
    let login_user = null;
    if (login_user_id) {
        login_user = denormalize(login_user_id,userSchema,entities)
    }

    return {
        'login_user'  :  login_user,
        'slider'      :  state.getIn(['setting','slider']),
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(PageWrapper);

