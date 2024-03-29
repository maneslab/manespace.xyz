import React, { Component } from 'react'
import { connect } from 'react-redux'

import { denormalize } from 'normalizr';
import { userSchema,clubSchema } from 'redux/schema/index'
import { loadClubDetail } from 'redux/reducer/club'
import Loading from 'components/common/loading'

export default function withClubView(WrappedComponent) {

    class WithClubViewComponent extends Component {

        constructor(props) {
            super(props)
            this.state = {}
        }

        componentDidMount() {
            if (this.props.club_id) {
                this.load({
                    id:this.props.club_id,
                    preview_key : this.props.preview_key
                })
            }else if (this.props.club_name) {
                this.load({
                    name:this.props.club_name,
                    preview_key : this.props.preview_key
                })
            }
        }

        load(cond) {
            if (typeof this.props.loadClubDetail !== 'function') {
                console.error('使用withPageView时候发现load方法不正确,得到的是:',typeof this.props.loadClubDetail)
            }
            this.props.loadClubDetail(cond);
        }

        componentWillUpdate(nextProps,nextState) {
            if (nextProps.club_id != this.props.club_id) {
                this.load({id:nextProps.club_id})
            }else if (nextProps.club_name != this.props.club_name) {
                this.load({name:nextProps.club_name})
            }
        }
        
        render() {

            const {club_data} = this.props;
            
            let is_fetched = (club_data) ? club_data.get('is_fetched') : false;

            if (is_fetched) {
                return <WrappedComponent {...this.props} />;
            }else {
                return <div className='flex justify-center py-12'>
                    <Loading />
                </div>
            }
        }

    }



    const mapDispatchToProps = (dispatch) => {
        return {
            loadClubDetail : (cond) => {
               return dispatch(loadClubDetail(cond))
            },
            // updateClub : (id,data) => {
            //    return dispatch(updateClub(id,data))
            // },
        }
   }
   function mapStateToProps(state,ownProps) {
   
        let entities = state.get('entities');
       
        ///注册成功

        let club_id = ownProps.club_id;   
        let club_name = ownProps.club_name;   

        let club_data = null;
        let club = null;
        if (club_id) {
            club_data = state.getIn(['club','map_id',ownProps.club_id]);
            if (club_id) {
               club = denormalize(club_id,clubSchema,entities)
            }
        }else if (club_name) {
            club_data = state.getIn(['club','map_name',ownProps.club_name]);
            if (club_data) {
               club = denormalize(club_data.get('result'),clubSchema,entities)
            }
        }

       let login_user_id = state.getIn(['setting','login_user']);
       let login_user = null;
       if (login_user_id) {
           login_user = denormalize(login_user_id,userSchema,entities)
       }
   
       return {
           'club'      : club,
           'club_data' : club_data,
           'login_user': login_user
       }
   
   }
   
   return connect(mapStateToProps,mapDispatchToProps)(WithClubViewComponent)

}

