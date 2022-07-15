import React from 'react';

import {wrapper} from 'redux/store';
import autobind from 'autobind-decorator'
import {ethers} from 'ethers';
import Link from 'next/link'


import withTranslate from 'hocs/translate';

import Loading from 'components/common/loading'
import Button from 'components/common/button'

import withClubView from 'hocs/clubview'

import config from 'helper/config'

import {hex2Number} from 'helper/number'
import { getUnixtime } from 'helper/time';

import mane from 'helper/web3/manestudio';
import manenft from 'helper/web3/manenft';

@withTranslate
@withClubView
class ClubView extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
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


    render() {
        const {t} = this.props.i18n;
        const {deploy_contract_address,is_fetching_contract_data,contract_data,contract_data_in_server,mint_count,is_fetching} = this.state;
        const {club,club_id,wallet,balance_map,type} = this.props;

        if (!club || !club.get('is_detail') || is_fetching_contract_data || is_fetching) {
            return <div className="flex justify-center py-12">
                <Loading />
            </div>
        }

        let mint_url = this.getMintUrl();
        // let contract = club.get('contract');
        // let merged_data = Object.assign({},contract_data_in_server,contract_data);

        // let {stage,stage_status,balance} = this.getProjectStage(merged_data);
        // console.log('debug-stage,当前项目的stage是',stage,stage_status,balance);

        // /*
        // 是否展示mint按钮
        // - 1.是否这个contract拥有已经部署的合约？
        // -   1.1.是否已经开始mint,并在白名单的mint时间内
        // -   1.2.是否已经开始mint,并在公开mint的时间内
        // -   1.3.是否已经结束mint时间了
        // */

        // console.log('merged_data',merged_data)
        // console.log('contract',contract.get('wl_price'),stage)

        let cn;
        switch (type) {
            case 'type1':
                cn = 'btn-primary';
                break;
            case 'type2':
                cn = 'btn-outline';
                break;
            case 'type3':
                cn = 'btn-secondary';
                break;
            case 'type4':
                cn = 'btn-accent';
                break;
            default:
                cn = 'btn-primary'
        }


        return <div className='flex justify-start items-center py-0 w-full'>
            <a href={mint_url} target="_blank" className='w-full block'>
                <button className={'btn btn-block w-full capitalize ' + cn} >mint</button>
            </a>
        </div>
    }
    
}

ClubView.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    return {
        club_id : query.id,
        address : (query.address) ? query.address : '',
        network : 'kovan',
        type    : query.type
    };
});


export default ClubView



