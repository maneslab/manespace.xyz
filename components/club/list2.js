import React from 'react';
// import Link from 'next/link'

import { connect } from "react-redux";
import { denormalize } from 'normalizr';

import Loading from 'components/common/loading'
import Empty from 'components/common/empty'
import ClubTwo  from 'components/club/two'

import {removeValueEmpty} from 'helper/common'

import {withPageList} from 'hocs/index'

import {loadClubList} from 'redux/reducer/club'
import {clubListSchema} from 'redux/schema/index'
import {withTranslate} from 'hocs/index'

import { Carousel } from 'react-responsive-carousel';


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

        let {list_data,entities} = this.props;
        const {t} = this.props.i18n;

        let list_data_one =  this.props.getListData(list_data)
        let list_rows = denormalize(list_data_one.get('list'),clubListSchema,entities)

        let is_fetching = list_data_one.get('is_fetching');
        let count = list_data_one.get('total');
        let is_empty = (list_data_one.get('is_fetched') && list_rows.count() == 0)

        /*
        if (is_fetching) {
            return <div>
                <Loading />
            </div>
        }*/

        if (is_empty)  {
            return null;
        }

        return  <Carousel showArrows={true} autoPlay={true} onClickItem={this.onClickItem} onClickThumb={this.onClickThumb} >
            {
                list_rows.map((one)=>{
                    return <div>
                        <ClubTwo club={one} key={one.get('id')+'_1'} />
                    </div>
                })
            }
        </Carousel>

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
    let result = removeValueEmpty({
        order_by        : props.order_by,
        address         : props.address
    })
    return result;
}

module.exports = connect(mapStateToProps,mapDispatchToProps,null, {forwardRef: true})(withPageList(MyClubList,{'formatData':formatData}))

