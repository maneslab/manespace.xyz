import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import EthIcon from 'public/img/token/eth.svg'

import {BadgeCheckIcon} from '@heroicons/react/solid'
import Link from 'next/link'
import {showTimeLeft} from 'helper/time'

import {getItemImage} from 'helper/common'
import {UserIcon} from '@heroicons/react/outline'
import { t } from 'helper/translate';
import Showtime from 'components/time/showtime';

class clubOne extends React.Component {

    render() {

        const { club } = this.props;

        let creator_name_list = [];
        club.get('creator').forEach((one)=>{
            creator_name_list.push(one.get('name'))
        });

        return <div>
            <Link href={"/project/"+club.get('id')}>
            <div className="cursor-pointer d-bg-c-1">
                <div className="w-full aspect-video overflow-hidden">
                    <img src="http://dev.static.manestudio.com/public/gallery/fd/6b/fd6be03709cb57ede19a622ddeffff39a0d44a0c.png" />
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
                        (club.getIn(['contract','wl_enable']))
                        ? <div className='flex justify-between items-center club-one-item'>
                            <div className='w-2/3'>
                                <label>{t('WL presale start')}</label>
                                <div className='v'>
                                    <Showtime unixtime={club.getIn(['contract','wl_start_time'])} timezone={false}/>
                                </div>
                            </div>
                            <div className='w-1/3'>
                                <label>{t('WL mint price')}</label>
                                <div className='v'>
                                    {parseFloat(club.getIn(['contract','wl_price']))} ETH
                                </div>
                            </div>
                        </div>
                        : null
                    }

                    {
                        (club.getIn(['contract','pb_enable']))
                        ? <div className='flex justify-between items-center club-one-item'>
                            <div className='w-2/3'>
                                <label>{t('public sale start')}</label>
                                <div className='v'>
                                    <Showtime unixtime={club.getIn(['contract','pb_start_time'])} timezone={false}/>
                                </div>
                            </div>
                            <div className='w-1/3'>
                                <label>{t('public price')}</label>
                                <div className='v'>
                                    {parseFloat(club.getIn(['contract','pb_price']))} ETH
                                </div>
                            </div>
                        </div>
                        : null
                    }

                    {
                        (club.getIn(['contract']))
                        ? <div className='flex justify-between items-center club-one-item'>
                            <div className='w-2/3'>
                                <label>{t('max supply')}</label>
                                <div className='v'>
                                {club.getIn(['contract','max_supply'])}
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
