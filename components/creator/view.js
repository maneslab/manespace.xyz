import React from 'react';

import autobind from 'autobind-decorator'
import {connect} from 'react-redux'

import withMustLogin from 'hocs/mustlogin';
import withTranslate from 'hocs/translate';


import CreatorOne from 'components/creator/one'

import {saveCreatorList,loadCreatorList} from 'redux/reducer/creator'
import { denormalize } from 'normalizr';
import {creatorListSchema} from 'redux/schema/index'
import { defaultListData } from 'helper/common';

@withTranslate
@withMustLogin
class CreatorUpdate extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            is_updating     : false,
            open_index      : null,
            draging_index   : null
        }

        this.timer  = null;
        this.formRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.club_id) {
            this.props.loadCreatorList({
                'club_id'   :   this.props.club_id
            });
        }
        // 
    }

    componentDidUpdate(prevProps,prevState) {
        if (this.props.club_id && this.props.club_id != prevProps.club_id) {
            this.props.loadCreatorList({
                'club_id'   :   this.props.club_id
            });
        }
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    @autobind
    toggleOpen(index) {
        console.log('debug05,toggleOpen',index)
        if (this.state.open_index === index) {
            this.setState({
                'open_index' :null
            })
        }else {
            this.setState({
                'open_index': index
            })
        }
    }

    @autobind
    async save(values) {

        console.log('debug05,values',values);


        this.setState({
            'is_updating' : true
        })
        
        await this.props.saveCreatorList({
            club_id : this.props.club.get('id'),
            json_data : JSON.stringify(values['creators'])
        });

        this.setState({
            'is_updating' : false
        })
    }

    @autobind
    handleDragStart(event) {
        const {active, over} = event;
        this.setState({
            'draging_index': active.id
        })
    }

    @autobind
    handleDragEnd(event) {
        const {active, over} = event;

        if (over) {
            console.log('debug05,handleDragEnd',active,over);

            let begin_index = Number(active.id)
            let end_index = Number(over.id)

            let values = Array.from(this.formRef.current.values.creators);
            let item = this.formRef.current.values.creators[begin_index];
            console.log('debug04,开始前',values)

            values.splice(begin_index, 1);
            console.log('debug04,中间',values)

            values.splice(end_index, 0, item);
    
            console.log('debug04,结束以后',values)
            this.formRef.current.setValues({
                'creators' : values
            })
    
        }

        this.setState({
            'draging_index': null
        })
    }

    @autobind
    addCreatorOne(arrayHelpers) {
        let rl = this.formRef.current.values.creators.length
        let uid =new Date().getTime();

        arrayHelpers.push({  
            id : uid ,
            name    :  '',
            title   :  '',
            bio     :  '',
            email   :   '',
            link    :   '',
            discord :   '',
            twitter_id      :  '',
            instagram_id    :  '',
        });
        this.setState({
            'open_index' : rl
        })
    }

    @autobind
    updateCreatorImage(index,data) {
        if (!this.formRef.current.values.creators || !this.formRef.current.values.creators[index]) {
            return false;
        }

        console.log('debug06,data',data,index)
        let creators = this.formRef.current.values.creators;
        creators[index]['img'] = data['data'];
        creators[index]['img_id'] = data['data']['img_id'];

        console.log('debug06,creators',creators)

        this.formRef.current.setValues({
            creators : creators
        })
    }

    render() {
        const {t} = this.props.i18n;
        const {is_updating,open_index,draging_index} = this.state;
        const {club,creators} = this.props;

        return  <div className='p-6 pt-4 bg-white mb-8'>
            <div className='block-title'>{t('creator')}</div>
            <div className='grid grid-cols-2 gap-5'>
    
                {creators.map((one,index) => <CreatorOne 
                    key={one.id} 
                    id={index}
                    club={club}
                    creator={one}
                />)}

            </div>
        </div>

    }
    
}
const mapDispatchToProps = (dispatch) => {
    return {
        loadCreatorList : (data) => {
           return dispatch(loadCreatorList(data))
        },
        saveCreatorList : (data) => {
            return dispatch(saveCreatorList(data))
        }
    }
}
function mapStateToProps(state,ownProps) {

    let club_id = ownProps.club.get('id');
    let list_data = state.getIn(['creator','list',club_id]);

    if (!list_data) {
        list_data = defaultListData
    }
    let creators = denormalize(list_data.get('list'),creatorListSchema,state.get('entities'));

    return {
        creators : creators,
        list_data : list_data,
        club_id   : club_id
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(CreatorUpdate)