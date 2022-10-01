import React from 'react';

import { connect } from "react-redux";
import {wrapper} from 'redux/store';
import Head from 'next/head'
import autobind from 'autobind-decorator'
import {ethers} from 'ethers';

import PageWrapper from 'components/pagewrapper'

import withTranslate from 'hocs/translate';
import CountBtn from 'components/common/count_btn'
import Price from 'components/misc/price'

import EditorView from 'components/common/editorview'
import Loading from 'components/common/loading'

import GalleryView from 'components/gallery/view'
import RoadmapOne from 'components/roadmap/one'
import CreatorOne from 'components/creator/one'
import Cal from 'components/time/cal'
import Button from 'components/common/button'

import withClubView from 'hocs/clubview'
import WhitelistCheck from 'components/whitelist/check'
import WhitelistCheckAuto from 'components/whitelist/check_auto'
import RefundModal from 'components/nft/refund_modal'
import NftList from 'components/nft/list'

import {myIsNaN} from 'helper/common'
import Countdown from 'components/common/countdown';

import { StatusOnlineIcon } from '@heroicons/react/outline';
import config from 'helper/config'
import { httpRequest } from 'helper/http';
import message from 'components/common/message';

import {removeSuffixZero,percentDecimal,hex2Number} from 'helper/number'
import Showtime from 'components/time/showtime'
import { getUnixtime,formatOverflowUnixtime } from 'helper/time';

import withWallet from 'hocs/wallet';
import mane from 'helper/web3/manestudio';
import manenft from 'helper/web3/manenft';
import ConnectWalletButton from 'components/wallet/connect_button';
import { setNftBalance } from 'redux/reducer/nft';

import Error404 from 'pages/404'

@withTranslate
@withClubView
@withWallet
class ClubView extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            is_fetching             : false,
            show_refund_modal       : false,

            deploy_contract_address     : null,
            contract_data_from_server   : {},
            contract_data               : {},
            is_paused                   : false,        //是否暂停
            mint_count                  : 2,

            refund_nft_id : null
        }
        this.nftlistRef  = React.createRef();
    }

    componentDidMount() {
        this.fetchContractDataInBlockchain();
        if (this.props.club) {
            ///把club里面对应的contract数据放入state中
            let contract = this.props.club.get('contract_info') ? this.props.club.get('contract_info') : this.props.club.get('contract')
            this.setContractDataInServer(contract);
        }
    }

    componentDidUpdate(prevProps) {

        // console.log('debug09,componentDidUpdate',this.props.club,this.props.club.equals(prevProps.club));

        if (this.props.club && !this.props.club.equals(prevProps.club)) {
            
            this.fetchContractDataInBlockchain();

            ///把club里面对应的contract数据放入state中
            let contract = this.props.club.get('contract_info') ? this.props.club.get('contract_info') : this.props.club.get('contract')
            
            this.setContractDataInServer(contract);
        }

        if (this.props.wallet && 
            (!prevProps.wallet || this.props.wallet.address != prevProps.wallet.address)) {
            this.updateBalanceOf();
            this.fetchContractDataInBlockchain();
        }
    } 

    @autobind
    setContractDataInServer(contract) {
        this.setState({
            contract_data_from_server : this.deformatContractDataFromServerContract(contract)
        })
    }

    @autobind
    setManeNftInstance() {
        const {deploy_contract_address} = this.state;
        this.manenft = new manenft(deploy_contract_address,this.props.i18n.t);
    }



    @autobind
    async updateBalanceOf(){
    
        const {wallet} = this.props;

        if (!wallet || !wallet.address) {
            return;
        }

        if (!this.manenft) {
            return;
        }

        let address = wallet.address;

        let result = await this.manenft.contract.balanceOf(address);
        let presale_mint_count = await this.manenft.contract.presaleMintCountByAddress(address);
        let sale_mint_count = await this.manenft.contract.saleMintCountByAddress(address);

        this.props.setNftBalance({
            'address'            : this.props.wallet.address,
            'contract_address'   : this.state.deploy_contract_address,
            'balance'            : Number(result.toString()),
            'presale_mint_count' : Number(presale_mint_count.toString()),
            'sale_mint_count'    : Number(sale_mint_count.toString())
        })
    }

    @autobind
    async getDeployedContractAddress() {
        // const {club_id} = this.props;
        console.log('debug-getDeployedContractAddress');

        let club_id = this.getClubId();
        if (!club_id) {
            console.log('debug-error:准备getDeployedContractAddress的时候发现club_id为空');
            return;
        }

        console.log('debug-getDeployedContractAddress,club_id:',club_id);

        let addr = '0x0';
        try {
            addr = await this.mane.contract.clubMap(club_id);
            console.log('debug-getDeployedContractAddress,addr:',addr);
        }catch(e) {
            console.log('debug-getDeployedContractAddress,error',e)
        }
        if (hex2Number(addr) != 0) {
            return addr;
        }else {
            return null;
        }
    }

    @autobind
    async fetchContractDataInBlockchain() {

        console.log('debug-fetchContractDataInBlockchain')

        const {wallet} = this.props;
        if (!wallet) {
            return;
        }

        this.mane = new mane(this.props.i18n.t,this.props.network);

        ///一开始需要设置is_fetching
        this.setState({
            'is_fetching' : true
        })

        let addr = await this.getDeployedContractAddress();

        this.setState({
            'deploy_contract_address'   : addr,
        })

        console.log('debug获得部署的合约地址是:',addr);

        ///如果检查到了已经部署的合约
        if (addr) {

            //设置基础的manenft的instance
            this.setManeNftInstance()

            ///开始通过方法去获得合约的数据
            this.setState({
                'is_fetching_contract_data' : true,
                'is_fetched_contract_data'  : false
            })


            ///获得contract数据
            let contract_data = await this.manenft.contract.getAll();

            let total_supply = await this.manenft.contract.totalSupply();
            if (total_supply) {
                total_supply = Number(total_supply.toString());
            }else {
                total_supply = 0;
            }

            let isForceRefundable = await this.manenft.contract.isForceRefundable();

            // console.log('debug01,contract_data',contract_data)
            let formated_data = this.deformatContractData(contract_data);
            // console.log('debug01,formated_data',formated_data)
            formated_data['is_force_refundable'] = (isForceRefundable == 1) ? true : false;
            formated_data['total_supply'] = total_supply;

            this.setState({
                'contract_data'             : formated_data,
                'is_fetching_contract_data' : false,
                'is_fetched_contract_data'  : true
            })

            //获得合约是否暂停
            let paused = await this.manenft.contract.paused();
            this.setState({
                is_paused : (paused == 1) ? true : false
            })

            //获得我持有的这个合约的NFT数量
            this.updateBalanceOf();

            //更新我可以mint的数量
            this.setCanMintCount();
        }

        this.setState({
            'is_fetching' : false
        })
    }


    deformatContractDataFromServerContract(contract) {
        let contract_data_formatted = {
            'reserve_count'         : Number(contract.get('reserve_count')),
            'max_supply'            : Number(contract.get('max_supply')),
            'presale_max_supply'    : Number(contract.get('wl_max_supply')),
            'club_id'               : Number(contract.get('club_id')),
            'presale_start_time'    : Number(contract.get('wl_start_time')),
            'presale_end_time'      : Number(contract.get('wl_end_time')),
            'sale_start_time'       : Number(contract.get('pb_start_time')),
            'sale_end_time'         : Number(contract.get('pb_end_time')),
            'presale_price'         : Number(contract.get('wl_price')),
            'sale_price'            : Number(contract.get('pb_price')),
            'presale_per_wallet_count'  : Number(contract.get('wl_per_address')),
            'sale_per_wallet_count'     : Number(contract.get('pb_per_address')),
        };
        return contract_data_formatted
    }

    deformatContractData(contract_data) {
        let contract_data_formatted = {
            'reserve_count'         : Number(contract_data[0].toString()),
            'max_supply'            : Number(contract_data[1].toString()),
            'presale_max_supply'    :   Number(contract_data[2].toString()),
            // 'club_id'               :   Number(contract_data[3].toString()),
            'presale_start_time'    :   Number(contract_data[4].toString()),
            'presale_end_time'      :   Number(contract_data[5].toString()),
            'sale_start_time'       :   Number(contract_data[6].toString()),
            'sale_end_time'         :   Number(contract_data[7].toString()), 
            // 'sale_end_time'         :  1665602611,
            'presale_price'         :   Number(contract_data[8].toString()),
            'sale_price'            :   Number(ethers.utils.formatEther(contract_data[9].toString())),
            // 'presale_per_wallet_count'  :   Number(contract_data[10].toString()),
            // 'sale_per_wallet_count'     :   Number(contract_data[11].toString()),
        };
        return contract_data_formatted
    }
    

    // @autobind
    // async fetchContractDataFromServer(addr,network) {
    //     let result = await httpRequest({
    //         'url'   :   '/v1/mane/get_all',
    //         'data'  : {
    //             contract_address : addr,
    //             network : network
    //         }
    //     })
    //     return result.data;
    // }

    @autobind
    toggleRefundModal() {
        this.setState({
            show_refund_modal : !this.state.show_refund_modal
        })
    }

    @autobind
    openRefundModal(nft_id) {
        this.setState({
            'refund_nft_id'     : nft_id,
            'show_refund_modal' : true
        })
    }

    @autobind
    getCalendarTitle(time_type = 'whitelist') {
        const {club} = this.props;
        const {t} =  this.props.i18n;
        switch(time_type) {
            case 'whitelist':
                return club.get('name') + ' ' + t('allowlist mint begin');
            case 'public':
                return club.get('name') + ' ' + t('public mint begin');
            default:
                return '';
        }
    }

    @autobind
    getMintUrl() {
        const {club} = this.props;
        if (club.get('unique_name')) {
            return config.get('WEBSITE') + '/project/' +club.get('unique_name')
        }else {
            return config.get('WEBSITE') + '/project/' +club.get('id')
        }
    }

    @autobind
    getClubId() {
        const {club,club_id} = this.props;
        if (club_id) {
            return club_id;
        }else if (club) {
            return club.get('id');
        }else {
            return '';  
        }
    }

    @autobind
    async getMintSignature() {

        const {wallet} = this.props;
        const {contract_data,contract_data_from_server,mint_count} = this.state;


        let merged_data = Object.assign({},contract_data_from_server,contract_data);

        let can_mint_count = this.getCanMintCount(merged_data);
        let mcount = (can_mint_count > mint_count) ? mint_count : can_mint_count;

        let club_id = this.getClubId();

        this.setState({
            'is_fetching_signature' : true
        })

        let result;
        try {
            result = await httpRequest({
                'url' : '/v1/club/get_mint_sign',
                'method' : 'GET',
                'data'  : {
                    'id'        : club_id,
                    'address'   : wallet.address,
                    'count'     : mcount
                }
            })

        }catch(e){
            console.log('debug-e',e);
            if (e.status == 'error') {
                message.error(e.message);
            }
        }

        this.setState({
            'is_fetching_signature' : false,
        })

        if (!result) {
            return false;
        }

        console.log('debug-01,result',result);
        if (result.status == 'success') {
            result.data.sign.r  = '0x'+result.data.sign.r
            result.data.sign.s  = '0x'+result.data.sign.s
            return result.data;
        }else {
            message.error(e.message);
            return false;
        }

    }

    @autobind
    async whiteListMint() {

        let sign = await this.getMintSignature();

        if (!sign) {
            return;
        }

        if (sign) {
            console.log('签名是:',sign);
        }


        const {deploy_contract_address} = this.state;
        const {wallet} = this.props;
        const {t} = this.props.i18n;

        if (!wallet || !wallet.address) {
            message.error('wallet is not connected');
            return;
        }
        
        if(!deploy_contract_address) {
            message.error('Contract address is not found');
            return;
        }


        const mint_price_in_wei = ethers.utils.parseEther(sign.wl_price);
        const total_mint_value = mint_price_in_wei.mul(sign.count)


        ///通过合约去预估gas
        let gas_estimate = await  this.manenft.estimateGasMint(wallet.address,mint_price_in_wei,sign.count,sign.deadline,sign.sign.r,sign.sign.s,sign.sign.v);

        let params_options = {
            'gasLimit': gas_estimate['gasLimit'].toString(),
            'value' : total_mint_value
        }

        var that = this;

        await this.manenft.request({
            'text' : {
                'loading' : t('minting nft'),
                'sent'    : t('mint tx sent'),
                'success' : t('mint tx successful'),
            },
            'func' : {
                'send_tx' : async () => {
                    let tx_in = await  this.manenft.contract.mint(wallet.address,mint_price_in_wei,sign.count,sign.deadline,sign.sign.r,sign.sign.s,sign.sign.v,params_options);
                    console.log('tx is send',tx_in)
                    return tx_in;
                },
                'before_send_tx' : () => {
                    that.setState({
                        is_minting : true,
                    })
                },
                'finish_tx' : () => {
                    that.setState({
                        is_minting : false,
                    })
                },
                'after_finish_tx' : () => {
                    message.success(t('mint NFT success'));
                    this.updateBalanceOf();
                    // console.log('after_finish_tx');
                    // this.getUserSafeBox(this.props.login_user.get('wallet_address'));
                }
            } 
        })
    }

    @autobind
    async mint() {

        const {deploy_contract_address,contract_data,contract_data_from_server,mint_count} = this.state;
        const {wallet} = this.props;
        const {t} = this.props.i18n;



        let merged_data = Object.assign({},contract_data_from_server,contract_data);

        //计算我现在还可以mint几个nft
        let can_mint_count = this.getCanMintCount(merged_data);
        let mcount = (can_mint_count > mint_count) ? mint_count : can_mint_count;


        if (!wallet || !wallet.address) {
            message.error('wallet is not connected');
            return;
        }
    
        // console.log('debug-mint,deploy_contract_address',deploy_contract_address);
        // console.log('debug-mint,mcount',mcount);

        if(!deploy_contract_address) {
            message.error('Contract address is not found');
            return;
        }

        if (!contract_data) {
            message.error('Contract data is not found');
            return;
        }


        const mint_price_in_wei = ethers.utils.parseEther(String(contract_data['sale_price']));
        // const deadline = 0

        let empty_bytes_32 = ethers.utils.formatBytes32String("")
        const total_mint_value = mint_price_in_wei.mul(mcount)

    
        let gas_estimate = await  this.manenft.estimateGasMint(wallet.address,mint_price_in_wei,mcount,0,empty_bytes_32,empty_bytes_32,0);

        let params_options = {
            'gasLimit': gas_estimate['gasLimit'].toString(),
            'value' : total_mint_value
        }

        // let params_options = {
        //     'gasLimit': 200000,
        //     'value' : total_mint_value
        // }

        var that = this;

        await this.manenft.request({
            'text' : {
                'loading' : t('minting nft'),
                'sent'    : t('mint tx sent'),
                'success' : t('mint tx successful'),
            },
            'func' : {
                'send_tx' : async () => {
                    let tx_in = await  this.manenft.contract.mint(wallet.address,mint_price_in_wei,mcount,0,empty_bytes_32,empty_bytes_32,0,params_options);
                    console.log('tx is send',tx_in)
                    return tx_in;
                },
                'before_send_tx' : () => {
                    that.setState({
                        is_minting : true,
                    })
                },
                'finish_tx' : () => {
                    that.setState({
                        is_minting : false,
                    })
                },
                'after_finish_tx' : () => {
                    message.success(t('mint NFT success'));
                    this.updateBalanceOf();
                    // console.log('after_finish_tx');
                    // this.getUserSafeBox(this.props.login_user.get('wallet_address'));
                },
                'error_tx' : () => {
                    that.setState({
                        is_minting : false,
                    })
                }
            } 
        })
    }

    @autobind
    getBalance(deploy_contract_address,address) {
        const {balance_map} = this.props;

        let default_data = {
            'balance' : 0,
            'presale_mint_count' : 0,
            'sale_mint_count' : 0,
        };

        if (!address) {
            return default_data;
        }

        default_data['balance'] = balance_map.getIn([deploy_contract_address,address,'total']) ?? 0;
        default_data['presale_mint_count'] = balance_map.getIn([deploy_contract_address,address,'presale_mint_count']) ?? 0;
        default_data['sale_mint_count'] = balance_map.getIn([deploy_contract_address,address,'sale_mint_count']) ?? 0;

        return default_data;
    }
    

    @autobind
    getProjectStage(merged_data) {
        const {club,wallet} = this.props;
        const {deploy_contract_address,is_paused} = this.state;
        let now_unixtime = getUnixtime();

        console.log('debug-stage,merged_data',merged_data)
        console.log('debug-stage,deploy_contract_address',deploy_contract_address)

        let stage = 'unstart';          ///stage状态分为:unstart,in_whitelist,in_public,finished
        let status = 'disable';         ///status状态分为:disable,enable,connect_wallet,out_of_limit

        let contract = null;
        if (club.get('contract_info')) {
            contract = club.get('contract_info')
        }else {
            contract = club.get('contract')
        }

        if (!deploy_contract_address) {
            stage = 'unstart';
        }else {
            if (contract && contract.getIn(['wl_enable'])
                &&  merged_data['presale_end_time'] > now_unixtime 
                && merged_data['presale_start_time'] <= now_unixtime ) {
                
                console.log('debug-stage,因为当前处于预售时间内,',now_unixtime,merged_data['presale_start_time'],merged_data['presale_end_time']);
                stage = 'in_whitelist';
            }
            if (contract && contract.getIn(['pb_enable'])
                && (merged_data['sale_end_time'] > now_unixtime || merged_data['sale_end_time'] == 0)
                && merged_data['sale_start_time'] <= now_unixtime ) {
                console.log('debug-stage,因为当前处于销售时间内,',now_unixtime,merged_data['sale_start_time'],merged_data['sale_end_time']);
                stage = 'in_public';
            }
            if (
                contract && contract.getIn(['pb_enable'])
                && merged_data['sale_end_time'] < now_unixtime 
                && merged_data['sale_end_time'] != 0
            ) {
                console.log('debug-stage,因为当前处于销售时间外,',now_unixtime,merged_data['sale_end_time']);
                stage = 'finished';
            }
        }
        
        let address  = (wallet && wallet.address) ? wallet.address : '';
        let {balance,presale_mint_count,sale_mint_count} = this.getBalance(deploy_contract_address,address);

        console.log('获得我已经mint的数据',balance,presale_mint_count,sale_mint_count,merged_data);

        let minted = 0;
        if (!wallet || !wallet.address) {
            status = 'connect_wallet';
        }else {

            console.log('debug-stage,当前用户持有的NFT数量是',balance,wallet.address);

            switch(stage) {
                case 'in_whitelist':
                    console.log('debug09:检查是否超过预期',presale_mint_count,merged_data['presale_per_wallet_count'])
                    if (presale_mint_count >= merged_data['presale_per_wallet_count']) {
                        status = 'out_of_limit';
                    }else {
                        status = 'enable';
                    }
                    minted = presale_mint_count;
                    break;
                case 'in_public':
                    if (sale_mint_count >= merged_data['sale_per_wallet_count']) {
                        status = 'out_of_limit';
                    }else {
                        status = 'enable';
                    }
                    minted = sale_mint_count;
                    break;
                    
            }
        }

        return {
            'stage'         : stage,
            'stage_status'  : status,
            'minted'        : minted
        }
    }

    @autobind
    handleMintCountChange(count) {
        this.setState({
            'mint_count' : count
        })
    } 

    @autobind
    refreshList() {
        if (this.nftlistRef.current) {
            // console.log('this.nftlistRef.current',this.nftlistRef.current);
            this.nftlistRef.current.refresh();
        }
        
    }

    @autobind
    getWlHtml(merged_data) {
        const {t} = this.props.i18n;
        let now_unixtime = getUnixtime();

        let mint_url = this.getMintUrl();

        if (now_unixtime > merged_data['presale_end_time']) {
            return <div className='w-1/2 box-one '>
                <div className='lb'>{t('allowlist presale')}</div>
                <div className='ma flex justify-start items-center'>
                    {t('finished')}
                </div>
            </div>

        }

        if (now_unixtime > merged_data['presale_start_time']) {
            return  <div className='w-1/2 box-one '>
                <div className='lb'>{t('allowlist presale end in')}</div>
                <div className='ma flex justify-start items-center'>
                    <Countdown unixtime={merged_data['presale_end_time']} />
                </div>
            </div>
        }else {
            return  <div className='w-1/2 box-one '>
                <div className='lb'>{t('allowlist presale start in')}</div>
                <div className='ma flex justify-start items-center'>
                    <Countdown unixtime={merged_data['presale_start_time']} />
                    <span className='ml-4 flex-item-center'>
                        <Cal begin_time={merged_data['presale_start_time']} 
                            text={this.getCalendarTitle('whitelist')} 
                            details={'url:'+mint_url} />
                    </span>
                </div>
            </div>
        }
    }

    isAllowRefundable(refund_list,is_force_refundable) {
        console.log('debug-refundable',refund_list,is_force_refundable);
        if (is_force_refundable) {
            return true;
        }
        if (!refund_list) {
            return false;
        }
        let now_unixtime = getUnixtime();
        let allow_refundable = false;
        refund_list.map((item,index) => {
            if (now_unixtime < item.get('end_time')) {
                allow_refundable = true;
            }
        })
        return allow_refundable;
    }


    @autobind
    getPbHtml(merged_data) {
        const {t} = this.props.i18n;
        let now_unixtime = getUnixtime();

        if (now_unixtime > merged_data['sale_end_time'] && merged_data['sale_end_time'] > 0) {
            return <div className='w-1/2 box-one '>
                <div className='lb'>{t('public sale')}</div>
                <div className='ma flex justify-start items-center'>
                    {t('finished')}
                </div>
            </div>
        }

        if (now_unixtime > merged_data['sale_start_time']) {
            return <div className='w-1/2 box-one '>
                <div className='lb'>{t('public sale end in')}</div>
                <div className='ma flex justify-start items-center'>
                    <Countdown unixtime={merged_data['sale_end_time']} />
                </div>
            </div>
        }else if (now_unixtime > merged_data['presale_end_time']) {
            return <div className='w-1/2 box-one '>
                <div className='lb'>{t('public sale start in')}</div>
                <div className='ma flex justify-start items-center'>
                    <Countdown unixtime={merged_data['presale_start_time']} />
                </div>
            </div>
        }else {
            return <div className='w-1/2 box-one '>
                <div className='lb'>{t('public sale start in')}</div>
                <div className='ma flex justify-start items-center'>
                    <Showtime unixtime={merged_data['presale_start_time']}  />
                </div>
            </div>
        }
    }

    @autobind
    getCanMintCount(merged_data) {
        let {stage,stage_status,minted} = this.getProjectStage(merged_data);

        let can_mint_count = 0
        if (stage_status == 'enable') {
            if (stage == 'in_whitelist') {
                can_mint_count = merged_data['presale_per_wallet_count'] - minted;
                console.log('can_mint_count',can_mint_count)
            }else if (stage =='in_public') {
                can_mint_count = merged_data['sale_per_wallet_count'] - minted;
            }
        }
        return can_mint_count;
    }

    @autobind
    setCanMintCount() {
        const {contract_data_from_server,contract_data} = this.state;
        let merged_data = Object.assign({},contract_data_from_server,contract_data);
        let can_mint_count = this.getCanMintCount(merged_data);
        this.setState({
            'mint_count' : can_mint_count
        })
    }

    render() {
        const {t} = this.props.i18n;
        const {deploy_contract_address,is_fetching_contract_data,contract_data,contract_data_from_server,mint_count,is_fetching,is_paused} = this.state;
        const {club,wallet,network,club_data} = this.props;

        // console.log('is_paused',is_paused)
        // console.log('contract_data',contract_data)
        // console.log('debug-club',club.toJS())

        let club_id = this.getClubId();

        if (club_data && club_data.get('is_fetched') && !club) {
            return  <Error404 />
        }

        if (!club || !club.get('is_detail') || is_fetching_contract_data || is_fetching || !club_id) {
            return <PageWrapper>
                <Head>
                    <title>{'Drop details'}</title>
                </Head>
                <div>
                    <div className="max-w-screen-xl mx-auto py-12">
                        <Loading />
                    </div>
                </div>
            </PageWrapper>
        }

        let mint_url = this.getMintUrl();
        let contract = club.get('contract_info') ? club.get('contract_info') : club.get('contract');
        let now_unixtime = getUnixtime();

        let is_connect_wallet = true;
        if (!wallet || !wallet.address) {
            is_connect_wallet = false;
        }


        let merged_data = Object.assign({},contract_data_from_server,contract_data);

        if (!merged_data['club_id']) {
            console.log('debug-003',merged_data,contract_data_from_server,contract_data);
            return null
        }


        let {stage,stage_status,minted} = this.getProjectStage(merged_data);


        //计算我现在还可以mint几个nft
        let can_mint_count = this.getCanMintCount(merged_data);

        let has_whitelist_stage = merged_data['presale_start_time'] > 0 && merged_data['presale_end_time'] > 1;


        let is_allow_refundable = this.isAllowRefundable(contract.get('refund'),merged_data['is_force_refundable']);
        /*
        是否展示mint按钮
        - 1.是否这个contract拥有已经部署的合约？
        -   1.1.是否已经开始mint,并在白名单的mint时间内
        -   1.2.是否已经开始mint,并在公开mint的时间内
        -   1.3.是否已经结束mint时间了
        */

        // console.log('contract-data',contract.toJS())
        // console.log('contract_data',contract_data)
        console.log('stage_status',stage_status)
        console.log('can_mint_count',can_mint_count,mint_count);
        console.log('merged_data',merged_data)

        return <PageWrapper>
            <Head>
                <title>{'Drop details'}</title>
            </Head>
            <div>
                <div className="max-w-screen-xl mx-auto pb-12 px-2 lg:px-0">

                    <div className='flex justify-start items-center mb-4 hidden lg:show'>
                        <StatusOnlineIcon className='h-8 w-8 mr-2' /><h2 className='h2'>{t('live now')}</h2>
                    </div>
            
                    <div className='p-6 d-bg-c-1 mb-8 flex justify-start flex-col lg:flex-row border-4 border-black dark:border-[#999]'>
                        <div className='lg:w-96 lg:h-96 overflow-hidden lg:mr-6'>
                            <GalleryView gallery={club.get('gallery')} club_id={club_id} />
                        </div>
                        <div className='flex-grow'>
                            <div className=''>
                                <div className='mb-4 py-4 border-b d-border-c-3'>
                                    <div className='h1'>{club.get('name')}</div>
                                </div>
                                {
                                    (contract && contract.get('wl_enable'))
                                    ?   <div className='flex justify-between '>
                                        {
                                            this.getWlHtml(merged_data)
                                        }
                                        
                                        <div className='w-1/2 box-one'>
                                            <div className='lb'>{t('allowlist presale price')}</div>
                                            <div className='ma'>
                                                {
                                                    (contract.get('wl_price'))
                                                    ? <Price price={contract.get('wl_price')} />
                                                    : t('not set yet')
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    : null
                                }
                                <div className='flex justify-between '>
                                    <div className='w-1/2 box-one '>
                                        <div className='lb'>{t('minted / total supply')}</div>
                                        <div className='ma flex justify-start items-center'>
                                            <span className='mr-1'>{
                                                (contract_data['total_supply'])
                                                ? contract_data['total_supply']
                                                : '(please connect wallet)'
                                            }</span>
                                            / {merged_data['max_supply']}
                                        </div>
                                    </div>
                                    <div className='w-1/2 box-one '>
                                        <div className='lb'>{t('allowlist supply')}</div>
                                        <div className='ma flex justify-start items-center'>
                                            {merged_data['presale_max_supply']}
                                        </div>
                                    </div>
                                </div>
                                {
                                    (contract && contract.get('pb_enable'))
                                    ?   <div className='flex justify-between '>
                                        {
                                            this.getPbHtml(merged_data)
                                        }
                                        <div className='w-1/2 box-one'>
                                            <div className='lb'>{t('public sale price')}</div>
                                            <div className='ma'>
                                                {
                                                    (merged_data && merged_data.hasOwnProperty('sale_price'))
                                                    ? <Price price={merged_data['sale_price']} />
                                                    : 'not set yet'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    : <div className='flex justify-between '>
                                        <div className='w-1/2 box-one '>
                                            <div className='lb'>{t('public sale starts in')}</div>
                                            <div className='ma'>
                                                {t('not set yet')}
                                            </div>
                                        </div>
                                        <div className='w-1/2 box-one'>
                                            <div className='lb'>{t('mint price')}</div>
                                            <div className='ma'>
                                                {t('not set yet')}
                                            </div>
                                        </div>
                                    </div>
                                }
                                

                                <div className='flex justify-center lg:justify-start items-center pt-4 border-t d-border-c-3'>
                                    {
                                        (is_paused == true)
                                        ? <button className='btn btn-primary btn-wide capitalize' disabled={true}>mint</button>
                                        : <>
                                            {
                                                (stage_status == 'disable')
                                                ? <button className='btn btn-primary btn-wide capitalize' disabled={true}>mint</button>
                                                : null
                                            }
                                            {
                                                (stage_status == 'enable')
                                                ? <>
                                                    {
                                                        (stage == 'in_whitelist')
                                                        ? <>
                                                        <CountBtn max_count={can_mint_count} count={(mint_count>can_mint_count)?can_mint_count:mint_count} handleCountChange={this.handleMintCountChange} />
                                                        <Button loading={this.state.is_minting} className='btn btn-primary lg:btn-wide capitalize' onClick={this.whiteListMint}>mint</Button>
                                                        </>
                                                        : null
                                                    }
                                                    {
                                                        (stage == 'in_public')
                                                        ? <>
                                                        <CountBtn max_count={can_mint_count} count={(mint_count>can_mint_count)?can_mint_count:mint_count} handleCountChange={this.handleMintCountChange} />
                                                        <Button loading={this.state.is_minting} className='btn btn-primary lg:btn-wide capitalize' onClick={this.mint}>mint</Button>
                                                        </>
                                                        : null
                                                    }
                                                </>
                                                : null
                                            }
                                            {
                                                (stage_status == 'out_of_limit')
                                                ? <button className='btn btn-primary btn-wide capitalize' disabled={true}>{t('Maximal Mint Limit Pre Wallet Reached')}</button>
                                                : null
                                            }
                                            {
                                                (stage_status == 'connect_wallet')
                                                ? <ConnectWalletButton />
                                                : null
                                            }
                                        </>
                                    }
                                    
                                    
                                </div>

                            </div>
                        </div>
                    </div>

                    {
                        (has_whitelist_stage)
                        ?  <div className='mb-8 w-full p-6 d-bg-c-1'>
                            <div className='block-title'>{t('allowlist eligibility')}</div>
                            <div className='grid lg:grid-cols-2 lg:gap-8'>
                                <WhitelistCheckAuto club_id={club_id} wallet={wallet}/>
                                <WhitelistCheck club_id={club_id}/>
                            </div>
                        </div>
                        : null
                    }
                   
                    <div className='mb-8 w-full p-6 d-bg-c-1'>
                        <div className='block-title'>{t('about')}</div>

                        <div className='lg:grid lg:grid-cols-12 gap-8'>
                            <div className="lg:col-span-6 border-r d-border-c-3">
                                <table className='info-table'>
                                    <thead>
                                        <tr>
                                            <th colspan={2}>
                                                {t('basic info')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='lttd'>
                                                {t('blockchain')}
                                            </td>
                                            <td className='rctd'>
                                                Ethereum
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='lttd'>
                                                {t('contract address')}
                                            </td>
                                            <td className='rctd'>
                                                {contract.get('contract_address')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='lttd'>
                                                {t('collection size')}
                                            </td>
                                            <td className='rctd'>
                                                {contract.get('max_supply')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='lttd'>
                                                1/1 NFTs
                                            </td>
                                            <td className='rctd'>
                                                {club.get('special_supply')}
                                            </td>
                                        </tr>
                                        
                                        <tr>
                                            <td className='lttd'>
                                                <span className='normal-case'>{t('Reserved for Team')}</span>
                                            </td>
                                            <td className='rctd'>
                                                {contract.get('reserve_count')}
                                            </td>
                                        </tr>
                                        {
                                            (Number(contract.get('reveal_time')) > 0)
                                            ? <tr>
                                                <td className='lttd'>
                                                    {t('reveal time')}
                                                </td>
                                                <td className='rctd'>
                                                    <Showtime unixtime={contract.get('reveal_time')} cale={true} />
                                                </td>
                                            </tr>
                                            : null
                                        }

                                    </tbody>
                                </table>
                                {
                                    (contract.get('wl_enable'))
                                    ? <><table className='info-table'>
                                        <thead>
                                            <tr>
                                                <th colspan={2}>
                                                    {t('allowlist')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('allowlist presale supply')}
                                                </td>
                                                <td className='rctd'>
                                                    {contract.get('wl_max_supply')}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('allowlist presale price')}
                                                </td>
                                                <td className='rctd'>
                                                    {removeSuffixZero(contract.get('wl_price'))}
                                                    <span className='ml-2 text-base'>ETH</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('allowlist mint time')}
                                                </td>
                                                <td className='rctd flex-col'>
                                                    <div className='flex justify-start items-center w-full'>
                                                        <Showtime unixtime={contract.get('wl_start_time')} />
                                                        <span className='ml-4 flex-item-center'>
                                                            <Cal begin_time={contract.get('wl_start_time')} 
                                                                text={this.getCalendarTitle('whitelist')} 
                                                                details={'url:'+mint_url} />
                                                        </span>
                                                    </div>
                                                    <div className='flex justify-start w-full'>
                                                        <Showtime unixtime={contract.get('wl_end_time')}  />
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </>
                                    : null
                                }
                                {
                                    (contract.get('pb_enable'))
                                    ? <><table className='info-table'>
                                        <thead>
                                            <tr>
                                                <th colspan={2}>
                                                    {t('public sale')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('public sale price')}
                                                </td>
                                                <td className='rctd'>
                                                    {removeSuffixZero(contract.get('pb_price'))}
                                                    <span className='ml-2'>ETH</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('public mint time')}
                                                </td>
                                                <td className='rctd flex-col'>
                                                <div className='flex justify-start items-center w-full'>
                                                        <Showtime unixtime={contract.get('pb_start_time')} cale={true} />
                                                        <span className='ml-4 flex-item-center'>
                                                            <Cal begin_time={contract.get('pb_start_time')} 
                                                                text={this.getCalendarTitle('public')} 
                                                                details={'url:'+mint_url} />
                                                        </span>
                                                    </div>
                                                    {
                                                        (formatOverflowUnixtime(contract.get('pb_end_time')))
                                                        ? <div className='flex justify-start w-full'>
                                                            <Showtime unixtime={formatOverflowUnixtime(contract.get('pb_end_time'))}  />
                                                        </div>
                                                        : <div className='flex justify-start w-full'>
                                                            {t('(no end time)')}
                                                        </div>
                                                    }
                                                    
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </>
                                    : null
                                }
                                {
                                    (contract.get('revenue_share') && contract.get('revenue_share').count() > 0)
                                    ? <><table className='info-table'>
                                        <thead>
                                            <tr>
                                                <th colspan={2}>
                                                    {t('spilt earnings')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                (contract.get('revenue_share').map((one,index) => {
                                                    return <tr>
                                                        <td className='lttd'>
                                                            {one.get('address')}
                                                        </td>
                                                        <td className='rctd'>
                                                            {percentDecimal(one.get('rate'))}%
                                                        </td>
                                                    </tr>
                                                }))
                                            }
                                        </tbody>
                                    </table>
                                    </>
                                    : null
                                }


                            </div>
                            <div className="col-span-6">
                                <EditorView content={club.get('introduction')} />
                            </div>
                        </div>

                    </div>

                    {
                        (club.get('creator').count() > 0)
                        ? <div className='p-6 pt-4 d-bg-c-1 mb-8'>
                            <div className='block-title'>{t('creator')}</div>
                            <div className='grid lg:grid-cols-2 gap-16'>
                                {club.get('creator').map((one,index) => <CreatorOne 
                                    key={one.id} 
                                    id={index}
                                    club={club}
                                    creator={one}
                                />)}
                            </div>
                        </div>
                        : null
                    }
                    
                    {
                        (club.get('roadmap').count() > 0)
                        ? <div className='p-6 pt-4 d-bg-c-1 mb-8'>
                            <div className='block-title'>{t('roadmap')}</div>
                            <div>
                                {club.get('roadmap').map((one,index) => <RoadmapOne 
                                    key={one.id} 
                                    id={index}
                                    roadmap={one}
                                />)}
                            </div>
                        </div>
                        : null
                    }

                    {
                        (contract.get('refund').count() > 0)
                        ?   <div className='p-6 pt-4 d-bg-c-1 mb-8'>
                            <div className='block-title'>{t('refund')}</div>

                            <div className='grid lg:grid-cols-2 gap-8'>
                                
                                <div>
                                {contract.get('refund').map((one,index) => {
                                    return <div className='flex justify-start' key={one.get('end_time')}>
                                        <div className='py-4 pr-8'>
                                            <label>{t('Refundable Period Until')}</label>
                                            <div className='text-xl font-bold'>
                                            <Showtime unixtime={one.get('end_time')} cale={true} />
                                            </div>
                                        </div>
                                        <div className='py-4'>
                                            <label>{t('Refundable Rate')}</label>
                                            <div className='text-xl font-bold'>
                                                {percentDecimal(one.get('refund_rate'))}%
                                            </div>
                                        </div>
                                    </div>
                                })}
                                </div>
                                <div>
                                    <h3 className='h3 mb-2'>
                                        {t('About Refund')}
                                    </h3>
                                    <div className='text-gray-500'>
                                        <p>
                                            {t('refund-intro')}
                                        </p>
                                    </div>
                                </div>

                            </div>

                        </div>
                        : null
                    }

                    {
                        (deploy_contract_address && wallet && wallet.address)
                        ? <NftList 
                            ref={this.nftlistRef}
                            contract_address={deploy_contract_address} 
                            address={wallet.address}
                            network={network}
                            is_allow_refundable={is_allow_refundable}
                            openRefundModal={this.openRefundModal}
                            />
                        : null
                    }

                    <RefundModal 
                        contract_address={deploy_contract_address} 
                        address={wallet ? wallet.address : ''}
                        visible={this.state.show_refund_modal} 
                        nft_id={this.state.refund_nft_id} 
                        closeModal={this.toggleRefundModal}
                        refreshList={this.refreshList}
                        />

                </div> 
            </div>
    </PageWrapper>
    }
    
}




ClubView.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    let network = config.get('ETH_NETWORK');
    let is_number = myIsNaN(query.id);
    return {
        club_id : (is_number) ? query.id : '',
        club_name : (is_number) ? '' : query.id,
        preview_key : (query.key) ? query.key : '',
        network : network
    };
});



const mapDispatchToProps = (dispatch) => {
    return {
        setNftBalance : (data) => {
            return dispatch(setNftBalance(data))
        }
    }
}
function mapStateToProps(state,ownProps) {
   return {
        'balance_map' : state.getIn(['nft','list']),
   }
}

export default connect(mapStateToProps,mapDispatchToProps)(ClubView)



