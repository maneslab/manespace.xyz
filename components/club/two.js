import React from 'react';
import autobind from 'autobind-decorator';

import Link from 'next/link'
import GalleryBlank from 'components/gallery/blank';
import Countdown from 'react-countdown';
import Cal from 'components/time/cal'

import {CheckCircleIcon} from '@heroicons/react/outline'
import { t } from 'helper/translate';
import Showtime from 'components/time/showtime';
import withTranslate from 'hocs/translate';
import config from 'helper/config'
import {removeSuffixZero} from 'helper/number'
import { getUnixtime } from 'helper/time';

import RefundIcon from 'public/img/icons/refund.svg'

@withTranslate
class clubOne extends React.Component {

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

    render() {

        const { club } = this.props;

        let creator_name_list = [];
        club.get('creator').forEach((one)=>{
            creator_name_list.push(one.get('name'))
        });

        let contract = club.get('contract_info') ? club.get('contract_info') : club.get('contract');

        let mint_url = this.getMintUrl();
        let now_unixtime = getUnixtime();

        console.log('contract-gallery',club.get('gallery').toJS());
        let is_whitelist = club.getIn(['white_list','is_whitelist']);

        let has_refund = false;
        if (contract.get('refund') && contract.get('refund').count() > 0) {
            has_refund = true;
        }

        // is_whitelist = true;
        return <div>
            <Link href={"/project/"+club.get('id')}>
            <div className='p-6 d-bg-c-1 mb-8 flex justify-start border-4 border-black dark:border-[#999] cursor-pointer'>
                <div className='w-96 h-96 overflow-hidden mr-10'>
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
                            <div>{
                                (has_refund)
                                ?   <span className='text-green-500 flex justify-end font-bold capitalize'><RefundIcon className="icon-sm mr-2"/> {t('refundable')}</span>
                                :   null
                            }</div>
                        </div>
                        {
                            (contract && contract.get('wl_enable'))
                            ?   <div className='flex justify-between '>
                                <div className='w-1/2 box-one '>
                                    <div className='lb'>{t('whitelist presale starts in')}</div>
                                    <div className='ma flex justify-start items-center'>
                                        {
                                            (contract.get('wl_start_time'))
                                            ? <>
                                            <Countdown date={contract.get('wl_start_time')*1000} />
                                            <span className='ml-4 flex-item-center'>
                                                <Cal begin_time={contract.get('wl_start_time')} 
                                                    text={this.getCalendarTitle('whitelist')} 
                                                    details={'url:'+mint_url} />
                                            </span>
                                            </>
                                            : t('not set yet')
                                        }
                                    </div>
                                </div>
                                <div className='w-1/2 box-one'>
                                    <div className='lb'>{t('whitelist presale price')}</div>
                                    <div className='ma'>
                                        {
                                            (contract.get('wl_price'))
                                            ? <>
                                                <span>{removeSuffixZero(contract.get('wl_price'))}</span>
                                                <span className='text-base ml-2'>ETH</span>
                                            </>
                                            : t('not set yet')
                                        }
                                    </div>
                                </div>
                            </div>
                            : null
                        }
                        <div className='flex justify-between '>
                            <div className='w-1/2 box-one '>
                                <div className='lb'>{t('minted / whitelist supply')}</div>
                                <div className='ma flex justify-start items-center'>
                                    {contract.get('total_supply') ? contract.get('total_supply') : 0} / {contract.get('wl_max_supply')}
                                </div>
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
                                <div className='w-1/2 box-one '>
                                    <div className='lb'>{t('public sale starts in')}</div>
                                    <div className='ma flex justify-start items-center'>
                                        {
                                            (contract.get('pb_start_time') > 0)
                                            ? <>
                                                {
                                                    (contract.get('pb_enable') && now_unixtime > Number(contract.get('wl_start_time')))
                                                    ? <Countdown date={contract.get('pb_start_time')*1000} />
                                                    : <>
                                                        <Showtime unixtime={contract.get('pb_start_time')} cale={true} />
                                                        <span className='ml-4 flex-item-center'>
                                                            <Cal begin_time={contract.get('pb_start_time')} 
                                                                text={this.getCalendarTitle('public')} 
                                                                details={'url:'+mint_url} />
                                                        </span>
                                                    </>
                                                }
                                            </>
                                            : 'not set yet'
                                        }
                                    </div>
                                </div>
                                <div className='w-1/2 box-one'>
                                    <div className='lb'>{t('public sale price')}</div>
                                    <div className='ma'>
                                        {
                                            (contract.get('pb_price'))
                                            ? <>
                                                <span>{removeSuffixZero(contract.get('pb_price'))}</span>
                                                <span className='text-base ml-2'>ETH</span>
                                            </>
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
                        

                        <div className='py-4 border-t d-border-c-3'>
                            <div className='text-gray-500 capitalize text-sm mb-2 text-left'>{t('your mint qualification')}</div>
                            {
                                (is_whitelist)
                                ? <div className='text-green-500 uppercase flex justify-start items-center font-bold text-left'> 
                                    <CheckCircleIcon className='icon-sm mr-2'/> {t('whitelisted')}
                                </div>
                                : <div className='font-bold text-gray-500 capitalize text-left'>
                                    {t('you are not in the whitelist')}
                                </div>
                            }
                            
                        </div>

                    </div>
                </div>
            </div>
            </Link>
        </div>
    }
}


module.exports = clubOne
