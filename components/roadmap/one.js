import React from 'react';
import classNames from 'classnames';
// import { useTranslation } from 'next-translate/useTranslation';

export default function SortableItem({roadmap,open_index,id,toggleOpen,remove,draging_index,errors}) {

    // let is_empty = (!roadmap['milestone'] && !roadmap['time_point']);
    // const {t} = useTranslation('common');

    return (
        <div className={classNames(' z-10 border-b d-border-c-2 mb-6 pb-2 last:mb-0 last:pb-0 last:border-b-0')} >
            <div>
                <div className='flex justify-start font-bold'>
                    <div className='py-1 pr-4 border-r d-border-c-2 '>
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
