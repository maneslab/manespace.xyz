import {removeSuffixZero} from 'helper/number'
import useTranslation from 'next-translate/useTranslation';
import BigNumber from "bignumber.js";

export default function Price({price}) { 
    const {t} = useTranslation('common');

    console.log('price',price);
    let price_bn = new BigNumber(price);

    if (!price_bn.gt(0)) {
        return <>{t('free mint')}</>
    }else {
        return (
            <>
            <span>{removeSuffixZero(price)}</span>
            <span className='text-base ml-2'>ETH</span>
            </>
        )
    }

}