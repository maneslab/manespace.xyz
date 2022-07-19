import React from 'react';
import Link from 'next/link'

import { connect } from "react-redux";
import autobind from 'autobind-decorator'
import { denormalize } from 'normalizr';

import Loading from 'components/common/loading'
import Empty from 'components/common/empty'
import Pager from 'components/common/pager'
import ClubOne  from 'components/club/one'

import {removeValueEmpty} from 'helper/common'

import {withPageList} from 'hocs/index'

import {loadClubList} from 'redux/reducer/club'
import {clubListSchema} from 'redux/schema/index'
import {withTranslate} from 'hocs/index'
import {UserGroupIcon} from '@heroicons/react/outline'

import {defaultListData} from 'helper/common'


@withTranslate
class MyClubList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            show_modal_id : null,
            show_modal    : 'close',
        }
        this.wapperRef = React.createRef();
    }

    render() {

        let {list_data,entities,pageSize,page} = this.props;
        const {t} = this.props.i18n;


        let list_data_one =  this.props.getListData(list_data)
        let list_rows = denormalize(list_data_one.get('list'),clubListSchema,entities)

        let is_fetching = list_data_one.get('is_fetching');
        let total = list_data_one.get('total');
        let is_empty = (list_data_one.get('is_fetched') && list_rows.count() == 0)


        return  <div>
            {
                (list_data_one.get('is_fetching'))
                ? <div className="my-16"><Loading /></div>
                : null
            }

            {
                (is_empty)
                ? <div className='py-12 my-12 text-center'>
                    <Empty text={t('no any project yet')} icon={<UserGroupIcon className='icon-base'/>}/>
                </div>
                : <div className='lg:grid lg:grid-cols-4 gap-4 px-4 lg:px-0'>

                    {
                        (list_data_one.get('is_fetched'))
                        ? <>
                            {
                                list_rows.map((one)=>{
                                    return <ClubOne club={one} key={one.get('id')} />
                                })
                            }
                        </>
                        : null
                    }
                </div>
            }

            {
                (total > 0) 
                ? <div className='py-8'>
                    <Pager page_size={pageSize} page={page} total={total} onChange={this.props.setPage} />
                </div>
                : null
            }
        </div>;

    }



    
}

function mapStateToProps(state,ownProps) {
    
    let list_data = state.getIn(['club','list'])

    return {
        entities    : state.getIn(['entities']),
        list_data   : list_data
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadList   : (cond) => {
            return dispatch(loadClubList(cond))
        },
    }
}
const formatData = (props) => {
    console.log('props',props)
    let result = removeValueEmpty({
        order_by        : props.order_by,
        address         : props.address
    })
    return result;
}

module.exports = connect(mapStateToProps,mapDispatchToProps,null, {forwardRef: true})(withPageList(MyClubList,{'formatData':formatData}))

