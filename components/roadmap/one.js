import React from 'react';
import classNames from 'classnames';
// import { useTranslation } from 'next-i18next';

export default function SortableItem({roadmap,open_index,id,toggleOpen,remove,draging_index,errors}) {

    // let is_empty = (!roadmap['milestone'] && !roadmap['time_point']);
    // const {t} = useTranslation('common');

    return (
        <div className={classNames('bg-[#fff] text-black z-10 border-b border-gray-200 mb-6 pb-2 last:mb-0 last:pb-0 last:border-b-0')} >
            <div>
                <div className='flex justify-start font-bold'>
                    <div className='py-1 pr-4 border-r border-black'>
                        {roadmap.get('time_point')}
                    </div>
                    <div className='py-1 px-4'>
                        {roadmap.get('title')}
                    </div>
                </div>
                <div className='py-4 font-normal text-sm'>
                    {roadmap.get('detail')}
                </div>
            </div>
        </div>
    );
}
