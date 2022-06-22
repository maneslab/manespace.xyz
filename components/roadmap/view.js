import React from 'react';

// import autobind from 'autobind-decorator'
import {connect} from 'react-redux'

import withMustLogin from 'hocs/mustlogin';
import withTranslate from 'hocs/translate';

import RoadmapEditorOne from 'components/roadmap/one'


import {saveRoadmapList,loadRoadmapList} from 'redux/reducer/roadmap'
import { denormalize } from 'normalizr';
import {roadmapListSchema} from 'redux/schema/index'
import { defaultListData } from 'helper/common';

@withTranslate
@withMustLogin
class RoadmapUpdate extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
        if (this.props.club_id) {
            this.props.loadRoadmapList({
                'club_id'   :   this.props.club_id
            });
        }

    }

    componentDidUpdate(prevProps,prevState) {
        if (this.props.club_id && this.props.club_id != prevProps.club_id) {
            this.props.loadRoadmapList({
                'club_id'   :   this.props.club_id
            });
        }
    }

    render() {
        const {t} = this.props.i18n;
        const {club,roadmaps} = this.props;

        return  <div className='p-6 pt-4 bg-white mb-8'>
            <div className='block-title'>{t('roadmap')}</div>

            <div>
                
                {roadmaps.map((one,index) => <RoadmapEditorOne 
                    key={one.id} 
                    id={index}
                    roadmap={one}
                />)}

            </div>

        </div>

    }
    
}
const mapDispatchToProps = (dispatch) => {
    return {
        loadRoadmapList : (data) => {
           return dispatch(loadRoadmapList(data))
        },
        saveRoadmapList : (data) => {
            return dispatch(saveRoadmapList(data))
        }
    }
}
function mapStateToProps(state,ownProps) {

    let club_id = ownProps.club.get('id');
    let list_data = state.getIn(['roadmap','list',club_id]);

    if (!list_data) {
        list_data = defaultListData
    }
    let roadmaps = denormalize(list_data.get('list'),roadmapListSchema,state.get('entities'));

    return {
        roadmaps : roadmaps,
        list_data : list_data,
        club_id   : club_id
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(RoadmapUpdate)