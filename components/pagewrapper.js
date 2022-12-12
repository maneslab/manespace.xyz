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
import {MenuIcon} from '@heroicons/react/outline'   
import Logo from 'public/img/logo/manespace.svg'

import config from 'helper/config'

@withTranslate
class PageWrapper extends React.Component {


    constructor(props) {
        super(props)
        this.state = {
            slider : false
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
        this.setState({
            slider : !this.state.slider
        })
    }


    render() {

        const {t} = this.props.i18n;
        const {theme,wapperClassName} = this.props;
        const {slider} = this.state;

        let manestudio_url = config.get('MANASTUDIO_WEBSITE');

        return (
            <div className={classNames("fullpage-container pt-16",{"blue":(theme == 'blue')})}>
                <Head>
                    <title>{config.get('NAME')}</title>
                    <link href="/img/favicon.png" rel="icon" type="image/x-icon" />
                </Head>
                <div>

                    <div className='header-bg dark:bg-[#22252b] mb-8 fixed w-full top-0 shadow-sm'>
                        <div className="flex justify-between h-16 w-full max-w-screen-xl mx-auto px-4 lg:px-0">

                            <div className='flex justify-start items-center'>

                                <Link href="/">
                                    <div>
                                    <Logo className="h-10" />
                                    </div>
                                </Link>

                                <div className='ml-4 hidden lg:flex lg:items-center'>
                                    <a className='font-bold capitalize ml-2' href={manestudio_url} target="_blank">{t('create project')}</a>
                                </div>

                            </div>
                            

                            <div className='flex justify-end items-center hidden lg:flex'>

                                <div className='mr-4 dark-switch'>
                                    <DarkmodeSwitch />
                                </div>

                                <GasButton />

                                <LanguageBtn />

                                <ConnectWalletButton />

                            </div>


                            <div className='flex justify-end items-center md:hidden'>
                                <div class="relative">
                                    <button class="text-black dark:text-white w-10 h-10 relative focus:outline-none" onClick={this.toggleSider}>
                                        <span class="sr-only">Open main menu</span>
                                        <div class="block w-5 absolute left-1/2 top-1/2   transform  -translate-x-1/2 -translate-y-1/2">
                                            <span aria-hidden="true" className={classNames("block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out" ,{'rotate-45': slider},{' -translate-y-1.5': !slider })}></span>
                                            <span aria-hidden="true" className={classNames("block absolute  h-0.5 w-5 bg-current   transform transition duration-500 ease-in-out",{'opacity-0': slider })}></span>
                                            <span aria-hidden="true" className={classNames("block absolute  h-0.5 w-5 bg-current transform  transition duration-500 ease-in-out",{'-rotate-45': slider},{' translate-y-1.5': !slider})}></span>
                                        </div>
                                    </button>
                                </div>
                            </div>


                        </div>
                    </div>
                    <div className="h-screen w-screen overflow-y-scroll pb-16">
                        <div className={(wapperClassName) ? wapperClassName : "py-4"}>
                            {this.props.children}
                        </div>
                        <Footer />
                    </div>

                    <div className={classNames('mobile-menu px-4',{"block":slider},{"hidden":!slider})}>
                        <div className='mobile-menu-one flex justify-center py-4 border-b d-border-c-1'>
                            <a className='font-bold capitalize text-black dark:text-white' href={manestudio_url} target="_blank">{t('create project')}</a>
                        </div>
                        <div className='mobile-menu-one  grid grid-cols-3 py-4 border-b d-border-c-1'>
                            <GasButton />
                            <div className='flex justify-center items-center text-black dark:text-white'>
                            <LanguageBtn />
                            </div>
                            <div className='flex justify-center items-center text-black dark:text-white'>
                                <DarkmodeSwitch />
                            </div>
                        </div>
                        <div className='mobile-menu-one flex justify-center  py-4'>
                            <ConnectWalletButton />
                        </div>
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

