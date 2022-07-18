import React from 'react';
import { connect } from "react-redux";

import Loading from 'components/common/loading'
import Empty from 'components/common/empty'
import NftOne  from 'components/nft/one'
import manenft from 'helper/web3/manenft'

import {removeValueEmpty,defaultListData} from 'helper/common'
import {withPageList,withTranslate} from 'hocs/index'

import {loadNftList} from 'redux/reducer/nft'
import {denormalize} from 'normalizr'
import {nftListSchema} from 'redux/schema/index'
import Pager  from 'components/common/pager';

@withTranslate
class NftList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            total : 0
        }
        this.manenft = null;
    }

    componentDidMount() {
        // this.getTotalBalance();
    }

    async getTotalBalance() {
        this.manenft = new manenft();
        let total = await this.manenft.contract.totalSupply();
        console.log('total',total);
        this.setState({
            'total' : Number(total.toString())
        })
    }
 
    render() {

        const {list_data_one,page,pageSize,network,contract_address,is_allow_refundable} = this.props;
        const {t} = this.props.i18n;


        let list_one = list_data_one.get('list');;
        let total = list_data_one.get('total');
        // let list_rows = denormalize(list_data_one.get('list'),nftListSchema,entities)

        return  <div className='p-6 pt-4 d-bg-c-1 mb-8'>
            <div className='block-title'>{t('My Nfts')} ({total})</div>
            <div className=''>
                {
                    (list_data_one.get('is_fetching'))
                    ? <div className='p-8 flex justify-center'><Loading /></div>
                    : null
                }
                {
                    (list_data_one.get('is_fetched') && list_one.count() == 0)
                    ? <Empty />
                    : null
                }
                {
                    (list_data_one.get('is_fetched'))
                    ? <div className='grid lg:grid-cols-6 gap-8'>
                        {
                            list_one.map((one)=>{
                                return <NftOne 
                                    nftid={one} 
                                    is_allow_refundable={is_allow_refundable}
                                    network={network}
                                    contract_address={contract_address}
                                    key={one} openRefundModal={this.props.openRefundModal} />
                            })
                        }
                    </div>
                    : null
                }
                {
                    (total > 0) 
                    ? <Pager page_size={pageSize} page={page} total={total} onChange={this.props.setPage} />
                    : null
                }
            </div>
        </div>
    }
}

function mapStateToProps(state,ownProps) {
    let list_data_one = state.getIn(['nft','list',ownProps.contract_address,ownProps.address])
    if (!list_data_one) {
        list_data_one = defaultListData
    }
    return {
        // entities        : state.getIn(['entities']),
        list_data_one   : list_data_one,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadList   : (cond) => {
            return dispatch(loadNftList(cond))
        },
    }
}
const formatData = (props) => {
    let result = removeValueEmpty({
        'contract_address' : props.contract_address,
        'address'          : props.address,
    })
    return result;
}

module.exports = connect(mapStateToProps,mapDispatchToProps,null, {forwardRef: true})(withPageList(NftList,{'formatData':formatData}))

