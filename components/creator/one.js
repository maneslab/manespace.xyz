import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';

import TwitterIcon  from 'public/img/social/default/twitter.svg';
import InstagramIcon  from 'public/img/social/default/instagram.svg';
import WebIcon  from 'public/img/social/default/web.svg';

export default function SortableItem({creator,club,id}) {
      
    console.log('creator',creator.toJS())
    const {t} = useTranslation('common');
    let is_empty = (!creator['name'] && !creator['title']);

    return (
        <div className={classNames('border border-black bg-[#fff] text-black z-10')}  >
            <div className='flex justify-between cursor-pointer'>

                <div className='border-r border-black'>
                    <div className='w-64'>
                        {
                            (!creator.getIn(['img','image_urls','url'])) 
                            ? <div className='aspect-square bg-gray-200'>

                            </div>
                            : <img src={creator.getIn(['img','image_urls','url'])} className="w-full"/>
                        }
                    </div>
                    <div className='p-4 border-b border-t border-black'>
                        <div className='text-base mb-0'>{creator.get('title')}</div>
                        <div className='text-2xl font-bold'>{creator.get('name')}</div>
                    </div>
                    <div className='flex justify-start items-center space-x-4 p-4'>
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
                            (creator.get('link'))
                            ? <a href={creator.get('link')} target="_blank"><WebIcon className="w-5" /></a>
                            : null
                        }
                        
                    </div>
                </div>
                <div className='text-left flex-grow p-4'>
                    {creator.get('bio')}
                </div>
            </div>
        </div>
    );
}
