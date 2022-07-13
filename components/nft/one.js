import React from 'react';
// import classNames from 'classnames';
import {DotsVerticalIcon,CurrencyDollarIcon} from '@heroicons/react/outline'
import useTranslation from 'next-translate/useTranslation'

export default function NftOne({nftid,openRefundModal}) {

    const {t} = useTranslation('common');

    return (
        <div className=''>
            <div className='relative'>
                <img src="http://dev.static.manestudio.com/public/gallery/bd/fa/bdfa104a2a4247eadf396d1f31d9006b267a2bbe.png" />
                <div class="dropdown dropdown-right absolute right-1 top-1">
                    <label tabindex="0" class="btn m-1 px-2 bg-transparent border-none text-gray-600 hover:text-black hover:bg-transparent dark:hover:bg-[#191c20] dark:text-white  ">
                        <DotsVerticalIcon className='icon-sm'/>
                    </label>
                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-white dark:bg-[#191c20] dark:text-white  rounded-box w-52 capitalize">
                        <li><a onClick={openRefundModal.bind({},nftid)}><CurrencyDollarIcon className="icon-sm" />{t('refund')}</a></li>
                    </ul>
                </div>
            </div>
            <div>
                #{nftid}
            </div>
        </div>
    );
}
