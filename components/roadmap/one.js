import React from 'react';
import classNames from 'classnames';
// import { useTranslation } from 'next-i18next';

export default function SortableItem({roadmap,open_index,id,toggleOpen,remove,draging_index,errors}) {

    // let is_empty = (!roadmap['milestone'] && !roadmap['time_point']);
    // const {t} = useTranslation('common');

    return (
        <div className={classNames('border border-black bg-[#fff] text-black z-10 border-b-0 last:border-b')} >
            <div>
                <div className='flex justify-start border-black border-b font-bold'>
                    <div className='p-4 border-r border-black'>
                        {roadmap.get('time_point')}
                    </div>
                    <div className='p-4'>
                        {roadmap.get('title')}
                    </div>
                </div>
                <div className='p-4 font-normal text-sm'>
                    {roadmap.get('detail')}
                </div>
            </div>
        </div>
    );
}
