import {removeSuffixZero} from 'helper/number'
import useTranslation from 'next-translate/useTranslation';
import BigNumber from "bignumber.js";
import {ethers} from 'ethers'

export default function Price({price}) { 
    const {t} = useTranslation('common');


    if (ethers.BigNumber.isBigNumber(price)) {
        if (price.isZero()) {
            return <>{t('free mint')}</>
        }else {
            console.log('debug,price',price,price.toString());
            return  <>
            <span>{ethers.utils.formatEther(price)}</span>
            <span className='text-base ml-2'>ETH</span>
            </>
        }
    }else {

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

}