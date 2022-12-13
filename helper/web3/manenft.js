import {  ethers } from "ethers";
import contract from "helper/web3/contract";
import manenft_v1_abi from 'helper/web3/abi/manenft_v1' 
import manenft_v2_abi from 'helper/web3/abi/manenft_v2' 
import {getAmountFromValueAndDecimals} from 'helper/web3/number'

export default class manenft extends contract{

    constructor(t = null,network = 'goerli',contract_address,contract_version='v2') {

        super(t);
        this.provider = new ethers.providers.Web3Provider(window.ethereum)

        
        console.log('manenft,constructor:',network,contract_address,contract_version);
        switch(contract_version) {
            case 'v2':
                this.contract = new ethers.Contract(contract_address, manenft_v2_abi, this.provider.getSigner());
                break;
            case 'v1':
                this.contract = new ethers.Contract(contract_address, manenft_v1_abi, this.provider.getSigner());
                break;
            default:
                this.contract = new ethers.Contract(contract_address, manenft_v2_abi, this.provider.getSigner());
                break;
        }

    }

    async isDeployed() {
        let result = await this.provider.getCode(this.contract.address)
        if (result == '0x') {
            return true;
        }else {
            return false;
        }
    }

    async estimateGasMint(...params) {

        // console.group('estimateGasMint');

        console.log('estimateGasMint调度的请求是：',params);

        let gasLimit = await this.contract.estimateGas.mint(...params);

        console.log('estimateGasDepositToken得到的gasLimit是：',gasLimit);

        let gasPrice = await this.provider.getGasPrice()
        console.log('estimateGasDepositToken得到的gasLimit是：',gasPrice);

        // console.endGroup();
        let gasFee = gasLimit.mul(gasPrice);
        return {
            gasLimit : gasLimit,
            gasPrice : ethers.utils.formatUnits(gasPrice,'gwei'),
            gasFee   : getAmountFromValueAndDecimals(gasFee.toString(),18)
        };
    }
  
}