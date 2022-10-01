import React from 'react';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation'

import TwitterIcon  from 'public/img/social/default/twitter.svg';
import InstagramIcon  from 'public/img/social/default/instagram.svg';
import WebIcon  from 'public/img/social/default/web.svg';
import DiscordIcon  from 'public/img/social/default/discord.svg';

import {MailIcon} from '@heroicons/react/outline'

export default function SortableItem({creator,club,id}) {
      
    // console.log('creator',creator.toJS())
    const {t} = useTranslation('common');
    let is_empty = (!creator['name'] && !creator['title']);

    let link = creator.get('link');

    //如果link不是https://开头,则自动加上https://
    if (link && link.indexOf('https://') !== 0) {
        link = 'https://'+link;
    }

    return (
        <div className={classNames('z-10')}  >
            <div className='flex justify-between'>

                <div className=''>
                    <div className='w-24 lg:w-48'>
                        {
                            (!creator.getIn(['img','image_urls','url'])) 
                            ? <div className='aspect-square bg-gray-200'>

                            </div>
                            : <img src={creator.getIn(['img','image_urls','url'])} className="w-full"/>
                        }
                    </div>
                    <div className='px-0 py-4'>
                        <div className='text-base mb-0 dark:text-gray-400'>{creator.get('title')}</div>
                        <div className='text-2xl font-bold'>{creator.get('name')}</div>
                    </div>
                    <div className='flex justify-start items-center space-x-4 px-0 py-2'>
                        {
                            (creator.get('twitter_id'))
                            ? <a href={"https://twitter.com/"+creator.get('twitter_id')} target="_blank"><TwitterIcon className="w-5" /></a>
                            : null
                        }
                        {
                            (creator.get('instagram_id'))
                            ? <a href={"https://instagram.com/"+creator.get('instagram_id')} target="_blank"><InstagramIcon className="w-5" /></a>
                            : null
                        }
                        {
                            (creator.get('discord'))
                            ? <a href={creator.get('discord')} target="_blank"><DiscordIcon className="w-5" /></a>
                            : null
                        }
                        {
                            (creator.get('link'))
                            ? <a href={link} target="_blank"><WebIcon className="w-5" /></a>
                            : null
                        }
                        {
                            (creator.get('email'))
                            ? <a href={"mailto:"+creator.get('email')} target="_blank"><MailIcon className="w-6" /></a>
                            : null
                        }
                    </div>
                </div>
                <div className='text-left flex-grow px-4 g:p-4 text-gray-500'>
                    {creator.get('bio')}
                </div>
            </div>
        </div>
    );
}
