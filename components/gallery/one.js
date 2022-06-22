import React from 'react';
// import classNames from 'classnames';
// import { useTranslation } from 'next-i18next';

export default function SortableItem({img,id}) {

    // console.log('img',img.toJS())

    // const {t} = useTranslation('common');

    return (
        <div>
            <img src={img.getIn(['img','image_urls','url'])} />
        </div>
    );
}
