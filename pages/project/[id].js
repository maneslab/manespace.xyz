import React from 'react';

import { connect } from "react-redux";
import {wrapper} from 'redux/store';
import Head from 'next/head'
import autobind from 'autobind-decorator'
import {ethers} from 'ethers';

import PageWrapper from 'components/pagewrapper'

import withTranslate from 'hocs/translate';
import CountBtn from 'components/common/count_btn'

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

import { StatusOnlineIcon } from '@heroicons/react/outline';

import Countdown from 'react-countdown';
import config from 'helper/config'
import { httpRequest } from 'helper/http';
import message from 'components/common/message';

import {autoDecimal,percentDecimal,hex2Number} from 'helper/number'
import Showtime from 'components/time/showtime'
import { getUnixtime } from 'helper/time';

// import {t} from 'helper/translate'
import withWallet from 'hocs/wallet';
import mane from 'helper/web3/manestudio';
import manenft from 'helper/web3/manenft';
import ConnectWalletButton from 'components/wallet/connect_button';
import { setNftBalance } from 'redux/reducer/nft';

@withTranslate
@withClubView
@withWallet
class ClubView extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            show_refund_modal       : false,

            deploy_contract_address     : null,
            contract_data_from_server   : {},
            contract_data               : {},
            is_paused                   : false,        //是否暂停
            mint_count                  : 2
        }
        this.mane = new mane(this.props.i18n.t,this.props.network);
        this.nftlistRef  = React.createRef();
    }

    componentDidMount() {
        this.fetchContractDataInBlockchain();
        if (this.props.club) {
            ///把club里面对应的contract数据放入state中
            this.setContractDataInServer(this.props.club.get('contract'));
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.club && !this.props.club.equals(prevProps.club)) {
            
            this.fetchContractDataInBlockchain();

            ///把club里面对应的contract数据放入state中
            this.setContractDataInServer(this.props.club.get('contract'));
        }

        if (this.props.wallet && 
            (!prevProps.wallet || this.props.wallet.address != prevProps.wallet.address)) {
            this.updateBalanceOf();
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

        let result = await this.manenft.contract.balanceOf(this.props.wallet.address);

        this.props.setNftBalance({
            'address'            : this.props.wallet.address,
            'contract_address'   : this.state.deploy_contract_address,
            'balance'            : Number(result.toString())
        })
    }

    @autobind
    async getDeployedContractAddress() {
        const {club_id} = this.props;
        let addr = '0x0';
        try {
            addr = await this.mane.contract.clubMap(club_id);
        }catch(e) {
            console.log('getDeployedAddress-e',e)
        }
        if (hex2Number(addr) != 0) {
            return addr;
        }else {
            return null;
        }
    }

    @autobind
    async fetchContractDataInBlockchain() {

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
            // console.log('debug01,contract_data',contract_data)
            let formated_data = this.deformatContractData(contract_data);
            // console.log('debug01,formated_data',formated_data)

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
            this.updateBalanceOf()
        }
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
            'reserve_count' : Number(contract_data[0].toString()),
            'max_supply'    : Number(contract_data[1].toString()),
            'presale_max_supply'    :   Number(contract_data[2].toString()),
            'club_id'               :   Number(contract_data[3].toString()),
            'presale_start_time'    :   Number(contract_data[4].toString()),
            'presale_end_time'      :   Number(contract_data[5].toString()),
            'sale_start_time'       :   Number(contract_data[6].toString()),
            'sale_end_time'         :   Number(contract_data[7].toString()),
            'presale_price'         :   Number(contract_data[8].toString()),
            'sale_price'            :   Number(ethers.utils.formatEther(contract_data[9].toString())),
            'presale_per_wallet_count'  :   Number(contract_data[10].toString()),
            'sale_per_wallet_count'     :   Number(contract_data[11].toString()),
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
                return club.get('name') + ' ' + t('whitelist mint begin');
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
    async getMintSignature() {

        const {club_id,wallet} = this.props;
        const {mint_count} = this.state;

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
                    'count'     : mint_count
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

        let params_options = {
            'gasLimit': 2000000,
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

        const {deploy_contract_address,contract_data} = this.state;
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

        if (!contract_data || !contract_data['sale_price']) {
            message.error('Contract data is not found');
            return;
        }


        const mint_price_in_wei = ethers.utils.parseEther(contract_data['sale_price']);
        const deadline = 0

        let empty_bytes_32 = ethers.utils.formatBytes32String("")

        let params_options = {
            'gasLimit': 2000000,
            'value' : mint_price_in_wei
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
                    let tx_in = await  this.manenft.contract.mint(wallet.address,mint_price_in_wei,0,empty_bytes_32,empty_bytes_32,0,params_options);
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

        if (!address) {
            return 0;
        }

        let count = balance_map.getIn([deploy_contract_address,address,'total']);
        if (count) {
            return count
        }else {
            return 0;
        }
    }
    

    @autobind
    getProjectStage(merged_data) {
        const {club,wallet} = this.props;
        const {deploy_contract_address,is_paused} = this.state;
        let now_unixtime = getUnixtime();

        let stage = 'unstart';          ///stage状态分为:unstart,in_whitelist,in_public,finished
        let status = 'disable';         ///status状态分为:disable,enable,connect_wallet,out_of_limit


        if (!deploy_contract_address) {
            stage = 'unstart';
        }else {
            if (club && club.getIn(['contract','wl_enable'])
                &&  merged_data['presale_end_time'] > now_unixtime 
                && merged_data['presale_start_time'] <= now_unixtime ) {
                
                console.log('debug-stage,因为当前处于预售时间内,',now_unixtime,merged_data['presale_start_time'],merged_data['presale_end_time']);
                stage = 'in_whitelist';
            }
            if (club && club.getIn(['contract','pb_enable'])
                && (merged_data['sale_end_time'] > now_unixtime || merged_data['sale_end_time'] == 0)
                && merged_data['sale_start_time'] <= now_unixtime ) {
                console.log('debug-stage,因为当前处于销售时间内,',now_unixtime,merged_data['sale_start_time'],merged_data['sale_end_time']);
                stage = 'in_public';
            }
            if (
                club && club.getIn(['contract','pb_enable'])
                && merged_data['sale_end_time'] < now_unixtime 
                && merged_data['sale_end_time'] != 0
            ) {
                console.log('debug-stage,因为当前处于销售时间外,',now_unixtime,merged_data['sale_end_time']);
                stage = 'finished';
            }
        }

        let balance = 0;
        if (!wallet || !wallet.address) {
            status = 'connect_wallet';
        }else {

            balance = this.getBalance(deploy_contract_address,wallet.address);
            console.log('debug-stage,当前用户持有的NFT数量是',balance,wallet.address);

            switch(stage) {
                case 'in_whitelist':
                    if (balance >= merged_data['presale_per_wallet_count']) {
                        status = 'out_of_limit';
                    }else {
                        status = 'enable';
                    }
                    break;
                case 'in_public':
                    if (balance >= merged_data['sale_per_wallet_count']) {
                        status = 'out_of_limit';
                    }else {
                        status = 'enable';
                    }
                    break;
                    
            }
        }

        return {
            'stage'         : stage,
            'stage_status'  : status,
            'balance'       : balance
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

    render() {
        const {t} = this.props.i18n;
        const {deploy_contract_address,is_fetching_contract_data,contract_data,contract_data_in_server,mint_count} = this.state;
        const {club,club_id,wallet,balance_map} = this.props;

        if (!club || !club.get('is_detail')) {
            return <PageWrapper>
                <Head>
                    <title>{'Drop details'}</title>
                </Head>
                <div>
                    <div className="max-w-screen-xl mx-auto pb-32">

                    </div>
                </div>
            </PageWrapper>
        }

        let mint_url = this.getMintUrl();
        let contract = club.get('contract');
        let now_unixtime = getUnixtime();
        let merged_data = Object.assign({},contract_data_in_server,contract_data);

        let {stage,stage_status,balance} = this.getProjectStage(merged_data);
        console.log('debug-stage,当前项目的stage是',stage,stage_status,balance);


        //计算我现在还可以mint几个nft
        let can_mint_count = 0
        if (stage_status == 'enable') {
            if (stage == 'in_whitelist') {
                can_mint_count = merged_data['presale_per_wallet_count'] - balance;
            }else if (stage =='in_public') {
                can_mint_count = merged_data['sale_per_wallet_count'] - balance;
            }
        }
        /*
        是否展示mint按钮
        - 1.是否这个contract拥有已经部署的合约？
        -   1.1.是否已经开始mint,并在白名单的mint时间内
        -   1.2.是否已经开始mint,并在公开mint的时间内
        -   1.3.是否已经结束mint时间了
        */


        if (is_fetching_contract_data) {
            return <PageWrapper>
                <Head>
                    <title>{'Drop details'}</title>
                </Head>
                <div>
                    <div className='p-12'>
                        <Loading />
                    </div>
                </div>
            </PageWrapper>
        }

        console.log('merged_data',merged_data)

        return <PageWrapper>
            <Head>
                <title>{'Drop details'}</title>
            </Head>
            <div>
                <div className="max-w-screen-xl mx-auto pb-32 pt-8">

                    <div className='flex justify-start items-center mb-4'>
                        <StatusOnlineIcon className='h-8 w-8 mr-2' /><h2 className='h2'>{t('live now')}</h2>
                    </div>
                    
            
                    <div className='p-6 d-bg-c-1 mb-8 flex justify-start border-4 border-black'>
                        <div className='w-96 h-96 overflow-hidden mr-6'>
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
                                            (stage == 'in_whitelist')
                                            ? <div className='w-1/2 box-one '>
                                                <div className='lb'>{t('whitelist presale ends in')}</div>
                                                <div className='ma flex justify-start items-center'>
                                                    {
                                                        (merged_data['presale_end_time'])
                                                        ? <>
                                                        <Countdown date={merged_data['presale_end_time']*1000} />
                                                        </>
                                                        : t('not set yet')
                                                    }
                                                </div>
                                            </div>
                                            : <div className='w-1/2 box-one '>
                                                <div className='lb'>{t('whitelist presale starts in')}</div>
                                                <div className='ma flex justify-start items-center'>
                                                    {
                                                        (merged_data['presale_start_time'])
                                                        ? <>
                                                        <Countdown date={merged_data['presale_start_time']*1000} />
                                                        <span className='ml-4 flex-item-center'>
                                                            <Cal begin_time={merged_data['presale_start_time']} 
                                                                text={this.getCalendarTitle('whitelist')} 
                                                                details={'url:'+mint_url} />
                                                        </span>
                                                        </>
                                                        : t('not set yet')
                                                    }
                                                </div>
                                            </div>
                                        }
                                        
                                        <div className='w-1/2 box-one'>
                                            <div className='lb'>{t('whitelist presale price')}</div>
                                            <div className='ma'>
                                                {
                                                    (contract.get('wl_price'))
                                                    ? <>
                                                        <span>{parseFloat(contract.get('wl_price'))}</span>
                                                        <span className='text-base ml-2'>ETH</span>
                                                    </>
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
                                            0 / {contract.get('max_supply')}
                                        </div>
                                    </div>
                                    <div className='w-1/2 box-one '>
                                        <div className='lb'>{t('whitelist supply')}</div>
                                        <div className='ma flex justify-start items-center'>
                                            {contract.get('wl_max_supply')}
                                        </div>
                                    </div>
                                </div>
                                {
                                    (contract && contract.get('pb_enable'))
                                    ?   <div className='flex justify-between '>
                                        <div className='w-1/2 box-one '>
                                            <div className='lb'>{t('public sale starts in')}</div>
                                            <div className='ma flex justify-start items-center'>
                                                {
                                                    (contract.get('pb_start_time') > 0)
                                                    ? <>
                                                        {
                                                            (contract.get('pb_enable') && now_unixtime > Number(contract.get('wl_start_time')))
                                                            ? <Countdown date={contract.get('pb_start_time')*1000} />
                                                            : <>

                                                                <Showtime unixtime={contract.get('pb_start_time')} cale={true} />
                                                                <span className='ml-4 flex-item-center'>
                                                                    <Cal begin_time={contract.get('pb_start_time')} 
                                                                        text={this.getCalendarTitle('public')} 
                                                                        details={'url:'+mint_url} />
                                                                </span>
                                                            </>
                                                        }
                                                    </>
                                                    : 'not set yet'
                                                }
                                            </div>
                                        </div>
                                        <div className='w-1/2 box-one'>
                                            <div className='lb'>{t('public sale price')}</div>
                                            <div className='ma'>
                                                {
                                                    (contract_data && contract_data['sale_price'])
                                                    ? <>
                                                        <span>{parseFloat(contract_data['sale_price'])}</span>
                                                        <span className='text-base ml-2'>ETH</span>
                                                    </>
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
                                

                                <div className='flex justify-start items-center py-4 border-t d-border-c-3'>
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
                                                <CountBtn max_count={can_mint_count} count={mint_count} handleCountChange={this.handleMintCountChange} />
                                                <Button loading={this.state.is_minting} className='btn btn-primary btn-wide capitalize' onClick={this.whiteListMint}>mint</Button>
                                                </>
                                                : null
                                            }
                                            {
                                                (stage == 'in_public')
                                                ? <>
                                                <CountBtn max_count={can_mint_count} count={mint_count} handleCountChange={this.handleMintCountChange} />
                                                <Button loading={this.state.is_minting} className='btn btn-primary btn-wide capitalize' onClick={this.mint}>mint</Button>
                                                </>
                                                : null
                                            }
                                        </>
                                        : null
                                    }
                                    {
                                        (stage_status == 'out_of_limit')
                                        ? <button className='btn btn-primary btn-wide capitalize' disabled={true}>{t('the maximum number of Mint has been reached')}</button>
                                        : null
                                    }
                                    {
                                        (stage_status == 'connect_wallet')
                                        ? <ConnectWalletButton />
                                        : null
                                    }
                                    
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className='mb-8 w-full p-6 d-bg-c-1'>
                        <div className='block-title'>{t('whitelist check')}</div>
                        <div className='grid grid-cols-2 gap-8'>
                            <WhitelistCheckAuto club_id={club_id} wallet={wallet}/>
                            <WhitelistCheck club_id={club_id}/>
                        </div>
                    </div>
                    <div className='mb-8 w-full p-6 d-bg-c-1'>
                        <div className='block-title'>{t('about')}</div>

                        <div className='grid grid-cols-12 gap-8'>
                            <div className="col-span-6 border-r d-border-c-3">
                                <table className='info-table'>
                                    <thead>
                                        <tr>
                                            <th colspan={2}>
                                                {t('basic')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
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
                                                1/1 NFT
                                            </td>
                                            <td className='rctd'>
                                                {contract.get('special_supply')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='lttd'>
                                                blockchain
                                            </td>
                                            <td className='rctd'>
                                                Ethereum
                                            </td>
                                        </tr>
                                    
                                        {
                                            (Number(contract.get('reveal_time')) > 0)
                                            ? <tr>
                                                <td className='lttd'>
                                                    {t('reveal in')}
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
                                                    {t('whitelist')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('whitelist spot')}
                                                </td>
                                                <td className='rctd'>
                                                    {contract.get('wl_max_supply')}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('whitelist presale price')}
                                                </td>
                                                <td className='rctd'>
                                                    {autoDecimal(contract.get('wl_price'))}
                                                    <span className='ml-2 text-base'>ETH</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('whitelist mint time')}
                                                </td>
                                                <td className='rctd'>
                                                    <Showtime unixtime={contract.get('wl_start_time')} cale={true} />
                                                    <span className='ml-4 flex-item-center'>
                                                        <Cal begin_time={contract.get('wl_start_time')} 
                                                            text={this.getCalendarTitle('whitelist')} 
                                                            details={'url:'+mint_url} />
                                                    </span>
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
                                                    {autoDecimal(contract.get('pb_price'))}
                                                    <span className='ml-2 text-base'>ETH</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('public mint time')}
                                                </td>
                                                <td className='rctd'>
                                                    <Showtime unixtime={contract.get('pb_start_time')} cale={true} />
                                                    <span className='ml-4 flex-item-center'>
                                                        <Cal begin_time={contract.get('pb_start_time')} 
                                                            text={this.getCalendarTitle('public')} 
                                                            details={'url:'+mint_url} />
                                                    </span>
                                                </td>
                                            </tr>
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

                    <div className='p-6 pt-4 d-bg-c-1 mb-8'>
                        <div className='block-title'>{t('creator')}</div>
                        <div className='grid grid-cols-2 gap-16'>
                            {club.get('creator').map((one,index) => <CreatorOne 
                                key={one.id} 
                                id={index}
                                club={club}
                                creator={one}
                            />)}
                        </div>
                    </div>

                    <div className='p-6 pt-4 d-bg-c-1 mb-8'>
                        <div className='block-title'>{t('roadmap')}</div>

                        <div>
                            
                            {club.get('roadmap').map((one,index) => <RoadmapOne 
                                key={one.id} 
                                id={index}
                                roadmap={one}
                            />)}

                        </div>

                    </div>

                    {
                        (contract.get('refund').count() > 0)
                        ?   <div className='p-6 pt-4 d-bg-c-1 mb-8'>
                            <div className='block-title'>{t('refund')}</div>

                            <div className='grid grid-cols-2 gap-8'>
                                
                                <div>
                                {contract.get('refund').map((one,index) => {
                                    return <div className='flex justify-start' key={one.get('end_time')}>
                                        <div className='py-4 pr-8'>
                                            <label>{t('locked ends in')}</label>
                                            <div className='text-xl font-bold'>
                                            <Showtime unixtime={one.get('end_time')} cale={true} />
                                            </div>
                                        </div>
                                        <div className='py-4'>
                                            <label>{t('refundable rate')}</label>
                                            <div className='text-xl font-bold'>
                                                {percentDecimal(one.get('refund_rate'))}%
                                            </div>
                                        </div>
                                    </div>
                                })}
                                </div>
                                <div>
                                    <h3 className='h3 mb-2'>
                                        {t('refund introduction')}
                                    </h3>
                                    <div className='text-gray-500'>
                                        <p>
                                            小幽灵是一个NFT项目，起源于最早的一个素描头像的构思，后来决定于发型在ETH上的NFT中，慢慢的我们对这个项目开始了更长时间的设计，规划。
                                        </p>
                                        <p>
                                            从一开始我们就希望做一个高质量的NFT项目，吸取国产项目的教训，并用真正的设计和实力来Build一个足够好的项目。
                                        </p>
                                        <p>
                                            在这里描述中，我们就需要更长的字数来介绍了，但是我是在不知道写了点什么就多一些一些，希望是可以个可以的啊打算啊苏丹啊苏丹。描述的中东。
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
                            openRefundModal={this.openRefundModal}
                            />
                        : null
                    }

                    <RefundModal 
                        contract_address={deploy_contract_address} 
                        address={wallet.address}
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
    return {
        club_id : query.id,
        address : (query.address) ? query.address : '',
        network : 'kovan'
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



