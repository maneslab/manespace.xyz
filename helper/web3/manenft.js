import {  ethers } from "ethers";
import contract from "helper/web3/contract";
import manenft_abi from 'helper/web3/abi/manenft' 

export default class manenft extends contract{

    constructor(contract_address,t = null) {

        // console.log('constructor-network',network);
        super(t);
        this.provider = new ethers.providers.Web3Provider(window.ethereum)
        this.contract = new ethers.Contract(contract_address, manenft_abi, this.provider.getSigner());
    }

  
}