import React from 'react';
import autobind from 'autobind-decorator';

import Link from 'next/link'
import GalleryBlank from 'components/gallery/blank';
import Countdown from 'components/common/countdown';
import Cal from 'components/time/cal'
import Price from 'components/misc/price'

import {CheckCircleIcon} from '@heroicons/react/outline'
import Showtime from 'components/time/showtime';
import withTranslate from 'hocs/translate';
import config from 'helper/config'
import { getUnixtime } from 'helper/time';

import RefundIcon from 'public/img/icons/refund.svg'
import manenft from 'helper/web3/manenft';
import { getParentContractVersion } from 'helper/web3/tools';

@withTranslate
class clubOne extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            total_supply : 0
        }
    }   

    componentDidMount() {
        this.getContractData();
    }

    @autobind
    async getContractData() {
        const {club} = this.props;
        const {t} = this.props.i18n;
        const newwork = config.get('ETH_NETWORK');
        const version = getParentContractVersion(club.get('id'));

        let contract_address = club.get('contract_address');
        if (!contract_address) {
            return;
        }

        try {
            console.log('debug05,在club one中获得数据');
            let manenft_instance = new manenft(t,newwork,contract_address,version);
            let total_supply = await manenft_instance.contract.totalSupply();
            if (total_supply) {
                total_supply = Number(total_supply.toString());
            }else {
                total_supply = 0;
            }

            this.setState({
                'total_supply' :total_supply
            })

        }catch(e) {
            console.log(e);
        }

    }

    @autobind
    getCalendarTitle(time_type = 'whitelist') {
        const {club} = this.props;
        const {t} =  this.props.i18n;
        switch(time_type) {
            case 'whitelist':
                return club.get('name') + ' ' + t('whitelist mint begin');
            case 'public':
                return club.get('name') + ' ' + t('public mint begin');
            default:
                return '';
        }
    }

    @autobind
    getMintUrl() {
        const {club} = this.props;
        if (club.get('unique_name')) {
            return config.get('WEBSITE') + '/project/' +club.get('unique_name')
        }else {
            return config.get('WEBSITE') + '/project/' +club.get('id')
        }
    }

    @autobind
    getWlHtml(contract) {
        const {t} = this.props.i18n;
        let now_unixtime = getUnixtime();
        let mint_url = this.getMintUrl();

        if (now_unixtime > contract.get('wl_end_time')) {
            return <div className='w-1/2 box-one '>
                <div className='lb'>{t('allowlist presale')}</div>
                <div className='ma flex justify-start items-center'>
                    {t('finished')}
                </div>
            </div>

        }

        if (now_unixtime > contract.get('wl_start_time')) {
            return  <div className='w-1/2 box-one '>
                <div className='lb'>{t('allowlist presale end in')}</div>
                <div className='ma flex justify-start items-center'>
                    <Countdown unixtime={contract.get('wl_end_time')} />
                </div>
            </div>
        }else {
            return  <div className='w-1/2 box-one '>
                <div className='lb'>{t('allowlist presale start in')}</div>
                <div className='ma flex justify-start items-center'>
                    <Countdown unixtime={contract.get('wl_start_time')} />
                    <span className='ml-4 flex-item-center'>
                        <Cal begin_time={contract.get('wl_start_time')} 
                            text={this.getCalendarTitle('whitelist')} 
                            details={'url:'+mint_url} />
                    </span>
                </div>
            </div>
        }
    }

    @autobind
    getPbHtml(contract) {
        const {t} = this.props.i18n;
        let now_unixtime = getUnixtime();

        if (now_unixtime > contract.get('pb_end_time')) {
            return <div className='w-1/2 box-one '>
                <div className='lb'>{t('public sale')}</div>
                <div className='ma flex justify-start items-center'>
                    {t('finished')}
                </div>
            </div>
        }

        if (now_unixtime > contract.get('pb_start_time')) {
            return <div className='w-1/2 box-one '>
                <div className='lb'>{t('public sale end in')}</div>
                <div className='ma flex justify-start items-center'>
                    <Countdown unixtime={contract.get('pb_end_time')} />
                </div>
            </div>
        }else if (now_unixtime > contract.get('wl_end_time')) {
            return <div className='w-1/2 box-one '>
                <div className='lb'>{t('public sale start in')}</div>
                <div className='ma flex justify-start items-center'>
                    <Countdown unixtime={contract.get('pb_start_time')} />
                </div>
            </div>
        }else {
            return <div className='w-1/2 box-one '>
                <div className='lb'>{t('public sale start in')}</div>
                <div className='ma flex justify-start items-center'>
                    <Showtime unixtime={contract.get('pb_start_time')}  />
                </div>
            </div>
        }
    }

    render() {

        const { club,wallet } = this.props;
        const {t} = this.props.i18n;
        const {total_supply} =this.state;

        let creator_name_list = [];
        club.get('creator').forEach((one)=>{
            creator_name_list.push(one.get('name'))
        });

        let contract = club.get('contract_info') ? club.get('contract_info') : club.get('contract');

        let now_unixtime = getUnixtime();

        console.log('contract-gallery',club.get('gallery').toJS());
        let is_whitelist = club.getIn(['white_list','is_whitelist']);

        if (!contract) {
            return null;
        }

        let has_refund = false;
        if (contract.get('refund') && contract.get('refund').count() > 0) {
            has_refund = true;
        }

        let has_whitelist_stage = club.getIn(['contract_info','wl_enable']);


        // is_whitelist = true;
        return <div>
            <Link href={"/project/"+club.get('id')}>
            <div className='p-6 d-bg-c-1 mb-8 flex justify-start flex-col lg:flex-row border-4 border-black dark:border-[#999] cursor-pointer'>
                <div className='lg:w-96 lg:h-96 overflow-hidden lg:mr-6'>
                    {
                        (club.getIn(['gallery',0,'img','image_urls','url']))
                        ? <img src={club.getIn(['gallery',0,'img','image_urls','url'])} />
                        : <GalleryBlank />
                    }
                </div>
                <div className='flex-grow'>
                    <div className=''>
                        <div className='mb-4 py-2 border-b d-border-c-3 flex justify-between'>
                            <div className='h1'>{club.get('name')}</div>
                            {
                                (has_refund)
                                ?   <div className='text-green-500 flex justify-end items-center font-bold capitalize'><RefundIcon className="icon-sm mr-2"/> {t('refundable')}</div>
                                :   null
                            }
                        </div>
                        {
                            (has_whitelist_stage)
                            ?   <div className='flex justify-between '>
                                {this.getWlHtml(contract)}
                                <div className='w-1/2 box-one'>
                                    <div className='lb'>{t('allowlist presale price')}</div>
                                    <div className='ma'>
                                        {
                                            (contract.get('wl_price'))
                                            ? <Price price={contract.get('wl_price')}/>
                                            : t('not set yet')
                                        }
                                    </div>
                                </div>
                            </div>
                            : null
                        }
                        <div className='flex justify-between '>
                            <div className='w-1/2 box-one '>
                                {
                                    (has_whitelist_stage)
                                    ? <div className='lb'>{t('minted')} / {t('allowlist supply')}</div>
                                    : <div className='lb'>{t('minted')}</div>
                                }
                                {
                                    (has_whitelist_stage)
                                    ? <div className='ma flex justify-start items-center'>
                                        {total_supply} / {contract.get('wl_max_supply')}
                                    </div>
                                    : <div className='ma flex justify-start items-center'>
                                        {
                                            (wallet && wallet.address) 
                                            ? <span>{total_supply}</span>
                                            : '(connect wallet)'
                                        }
                                    </div>
                                }
                                
                                
                            </div>
                            <div className='w-1/2 box-one '>
                                <div className='lb'>{t('total supply')}</div>
                                <div className='ma flex justify-start items-center'>
                                    {contract.get('max_supply')}
                                </div>
                            </div>
                        </div>
                        {
                            (contract && contract.get('pb_enable'))
                            ?   <div className='flex justify-between '>
                                {
                                    this.getPbHtml(contract)
                                }
                                <div className='w-1/2 box-one'>
                                    <div className='lb'>{t('public sale price')}</div>
                                    <div className='ma'>
                                        {
                                            (contract.get('pb_price'))
                                            ? <Price price={contract.get('pb_price')}/>
                                            : 'not set yet'
                                        }
                                    </div>
                                </div>
                            </div>
                            : <div className='flex justify-between '>
                                <div className='w-1/2 box-one '>
                                    <div className='lb'>{t('public sale starts in')}</div>
                                    <div className='ma'>
                                        {t('not set yet')}
                                    </div>
                                </div>
                                <div className='w-1/2 box-one'>
                                    <div className='lb'>{t('mint price')}</div>
                                    <div className='ma'>
                                        {t('not set yet')}
                                    </div>
                                </div>
                            </div>
                        }
                        
                        {
                            (has_whitelist_stage)
                            ? <div className='py-4 border-t d-border-c-3'>
                                <div className='text-gray-500 capitalize text-sm mb-2 text-left'>{t('allowlist eligibility')}</div>
                                {
                                    (is_whitelist)
                                    ? <div className='text-green-500 uppercase flex justify-start items-center font-bold text-left'> 
                                        <CheckCircleIcon className='icon-sm mr-2'/> {t('allowlisted')} :)
                                    </div>
                                    : <div className='font-bold text-gray-500 capitalize text-left'>
                                        {t('not allowlisted')} :(
                                    </div>
                                }
                            </div>
                            : null
                        }
                        
                    </div>
                </div>
            </div>
            </Link>
        </div>
    }
}


module.exports = clubOne
