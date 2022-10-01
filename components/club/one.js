import React from 'react';

import Link from 'next/link'
import {UserIcon} from '@heroicons/react/outline'
// import { t } from 'helper/translate';
import Showtime from 'components/time/showtime';
import {removeSuffixZero} from 'helper/number'
import {CheckCircleIcon} from '@heroicons/react/outline'
import GalleryBlank from 'components/gallery/blank';
import withTranslate from 'hocs/translate';

@withTranslate
class clubOne extends React.Component {

    render() {

        const { club } = this.props;
        const {t} = this.props.i18n;

        // console.log('debug-club-01',club.toJS())

        let creator_name_list = [];
        club.get('creator').forEach((one)=>{
            creator_name_list.push(one.get('name'))
        });

        let contract = (club.get('contract_info')) ? club.get('contract_info') : club.get('contract');
        let is_whitelist = club.getIn(['white_list','is_whitelist']);

        if (!contract) {
            return null;
        }
        
        // is_whitelist = true;
        //t('minted')} / 
        /* {contract.getIn(['total_supply']) ? contract.getIn(['total_supply']) : 0}
                                <span className='mx-1'>/</span> */
        return <div>
            <Link href={"/project/"+club.get('id')}>
            <div className="cursor-pointer d-bg-c-1">
                <div className="w-full aspect-square overflow-hidden relative">
                    {
                        (club.getIn(['gallery',0,'img','image_urls','url']))
                        ? <img src={club.getIn(['gallery',0,'img','image_urls','url'])} />
                        : <GalleryBlank size={'middle'}/>
                    }
                    {
                        (is_whitelist)
                        ? <div className='absolute top-0 right-0 flex justify-end items-center bg-green-500 py-1 px-2 text-white uppercase text-sm'><CheckCircleIcon className="icon-sm mr-2" />{t('allowlisted')}</div>
                        : null
                    }
                </div>
                <div className="flex-grow p-4">
                    <h2 className='font-bold text-lg capitalize'>{club.get('name')}</h2>
                    {
                        (club.get('creator').count() > 0) 
                        ? <div className='flex justify-start items-center dark:text-gray-500'>
                            <UserIcon className='icon-xs mr-2' />
                            {creator_name_list.join(' / ')}
                        </div>
                        : null
                    }
                    <div className='border-t d-border-c-1 my-4'></div>

                    {
                        (contract.getIn(['wl_enable']))
                        ? <div className='flex justify-between items-center club-one-item'>
                            <div className='w-3/5'>
                                <label className="capitalize">{t('presale start')}</label>
                                <div className='v'>
                                    <Showtime unixtime={contract.getIn(['wl_start_time'])} timezone={false}/>
                                </div>
                            </div>
                            <div className='w-2/5'>
                                <label className="capitalize">{t('presale price')}</label>
                                <div className='v'>
                                    {removeSuffixZero(contract.getIn(['wl_price']))} ETH
                                </div>
                            </div>
                        </div>
                        : null
                    }

                    {
                        (contract.getIn(['pb_enable']))
                        ? <div className='flex justify-between items-center club-one-item'>
                            <div className='w-3/5'>
                                <label className="capitalize">{t('public sale start')}</label>
                                <div className='v'>
                                    <Showtime unixtime={contract.getIn(['pb_start_time'])} timezone={false}/>
                                </div>
                            </div>
                            <div className='w-2/5'>
                                <label className="capitalize">{t('public price')}</label>
                                <div className='v'>
                                    {removeSuffixZero(contract.getIn(['pb_price']))} ETH
                                </div>
                            </div>
                        </div>
                        : null
                    }

                    {
                        (contract)
                        ? <div className='flex justify-between items-center club-one-item'>
                            <div className='w-2/3'>
                                <label>{t('max supply')}</label>
                                <div className='v'>
                                {contract.getIn(['max_supply'])}
                                </div>
                            </div>
                        </div>
                        : null
                    }
                    
                </div>

            </div>
            </Link>
        </div>
    }
}


module.exports = clubOne
