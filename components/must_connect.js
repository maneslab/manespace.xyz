import React,{useEffect,useState} from 'react';
import ConnectButton  from 'components/wallet/connect_button';
import { useAccount } from 'wagmi'

const MustConnectWalletWrapper = ({ children}) => {
    const { data, isError, isLoading } = useAccount()

    return <div>
        {
            (!data || !data.address)
            ?  <div>
                <div  className='flex justify-center py-24'>
                    <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon"/>
                </div>
            </div>
            :  <div>
                {children}
            </div>
        }
    </div>

}; 

export default MustConnectWalletWrapper; 