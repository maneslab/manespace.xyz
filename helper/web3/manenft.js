import {  ethers } from "ethers";
import contract from "helper/web3/contract";
import manenft_abi from 'helper/web3/abi/manenft' 
import {getAmountFromValueAndDecimals} from 'helper/web3/number'

export default class manenft extends contract{

    constructor(contract_address,t = null) {

        // console.log('constructor-network',network);
        super(t);
        this.provider = new ethers.providers.Web3Provider(window.ethereum)
        this.contract = new ethers.Contract(contract_address, manenft_abi, this.provider.getSigner());
    }

    async estimateGasMint(...params) {


        console.log('estimateGasMint调度的请求是：',params);

        let gasLimit = await this.contract.estimateGas.mint(...params);

        console.log('estimateGasDepositToken得到的gasLimit是：',gasLimit);

        let gasPrice = await this.provider.getGasPrice()
        console.log('estimateGasDepositToken得到的gasLimit是：',gasPrice);


        let gasFee = gasLimit.mul(gasPrice);
        return {
            gasLimit : gasLimit,
            gasPrice : ethers.utils.formatUnits(gasPrice,'gwei'),
            gasFee   : getAmountFromValueAndDecimals(gasFee.toString(),18)
        };
    }
  
}