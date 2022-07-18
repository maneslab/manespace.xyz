import {useEffect,useState} from 'react';
import {DotsVerticalIcon,CurrencyDollarIcon} from '@heroicons/react/outline'
import useTranslation from 'next-translate/useTranslation'
import config from 'helper/config'

import Loading from 'components/common/loading'

export default function NftOne({nftid,network,contract_address,openRefundModal,is_allow_refundable}) {

    const {t} = useTranslation('common');


    let api_base = config.get('API');

    const [is_fetching, setIsFetching] = useState(false);
    const [animation_url, setAnimationUrl] = useState('');
    const [image_url, setImageUrl] = useState('');


    useEffect(() => {
        
        setIsFetching(true);

        // console.log('debugxx',network,contract_address,nftid);

        let metadata_url = api_base + '/nft/' + contract_address.toLowerCase() + '/' + nftid;

        // console.log('debugxx,metadata_url',metadata_url);

        fetch(metadata_url).then(response=>{
            return response.json();
        }).then(data=>{
            setIsFetching(false);
            setAnimationUrl(data.animation_url ? data.animation_url : '');
            setImageUrl(data.image ? data.image : '');
        })
        
    },[network,contract_address,nftid]);
    

    console.log('debugxx,animation_url',animation_url);
    console.log('debugxx,image_url',image_url);
    console.log('debugxx,is_fetching',is_fetching);

    return (
        <div className=''>
            <div className='relative'>
                {
                    (animation_url)
                    ? <video autoplay muted loop className="w-full">
                        <source src={animation_url} type="video/mp4" />
                    </video>
                    : <>
                        {
                            (image_url)
                            ? <img src={image_url} className="w-full"/>
                            : <div className='bg-gray-100 w-full aspect-square flex justify-center items-center'>
                                <div className='text-gray-300'>{'no placeholder'}</div>
                            </div>
                        }
                    </>
                }

                {
                    (is_fetching)
                    ? <div className='absolute top-0 w-full h-full flex justify-center items-center'>
                        <Loading />
                    </div>
                    : null
                }
                {
                    (is_allow_refundable)
                    ?<div class="dropdown dropdown-right absolute right-1 top-1">
                        <label tabindex="0" class="btn m-1 px-2 bg-transparent border-none text-gray-600 hover:text-black hover:bg-transparent dark:hover:bg-[#191c20] dark:text-white  ">
                            <DotsVerticalIcon className='icon-sm'/>
                        </label>
                        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-white dark:bg-[#191c20] dark:text-white  rounded-box w-52 capitalize">
                            <li><a onClick={openRefundModal.bind({},nftid)}><CurrencyDollarIcon className="icon-sm" />{t('refund')}</a></li>
                        </ul>
                    </div>
                    : null
                }
            </div>
            <div>
                #{nftid}
            </div>
        </div>
    );
}
