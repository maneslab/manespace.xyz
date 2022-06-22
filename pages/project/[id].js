import React from 'react';

import {wrapper} from 'redux/store';
import Head from 'next/head'
import autobind from 'autobind-decorator'
import {connect} from 'react-redux'

import PageWrapper from 'components/pagewrapper'
import ClubHeader from 'components/club/header'

import withMustLogin from 'hocs/mustlogin';
import withTranslate from 'hocs/translate';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {updateClub} from 'redux/reducer/club'

import RoadmapUpdate from 'components/roadmap/view'
import GalleryUpdate from 'components/gallery/update'
import CreatorView from 'components/creator/view'

import ClubUpdate from 'components/club/update'
import withClubView from 'hocs/clubview'

import { StatusOnlineIcon } from '@heroicons/react/outline';


@withTranslate
@withMustLogin
@withClubView
class ClubView extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            is_public : false
        }
    }

    componentDidMount() {
        if (this.props.club) {
            this.setState({
                'is_public' : Number(this.props.club.get('is_public'))
            })
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.club && !this.props.club.equals(prevProps.club)) {
            this.setState({
                'is_public' : Number(this.props.club.get('is_public'))
            })
        }
    } 


    @autobind
    toggleCreateModal() {
        this.setState({
            show_create_modal : !this.state.show_create_modal
        })
    }

    @autobind
    onPublicChange(e) {
        this.setState({
            'is_public' :  e.target.checked
        })
        this.props.updateClub(this.props.club_id,{
            'is_public': e.target.checked ? 1: 0
        })
    }

    render() {
        const {t} = this.props.i18n;
        const {is_public} = this.state;
        const {club,club_id} = this.props;


        let init_data ={
            'name' : '',
            'project_type' : 'use_generator'
        }

        const formSchema = Yup.object().shape({
            name      : Yup.string().required(),
            project_type : Yup.string().required(),
        });

        return <PageWrapper>
            <Head>
                <title>{'Drop details'}</title>
            </Head>
            <div>
                <div className="max-w-screen-xl mx-auto pb-32">


                    <div className='flex justify-start items-center mb-4 text-black'>
                        <StatusOnlineIcon className='h-8 w-8 mr-2' /><h2 className='h2'>{t('live now')}</h2>
                    </div>
                    

                    <GalleryUpdate club={club} />

                    <ClubUpdate club={club} updateClub={this.props.updateClub}/>

                    <CreatorView club={club} />

                    <RoadmapUpdate club={club} />


                </div> 
            </div>
    </PageWrapper>
    }
    
}

ClubView.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    return {
        club_id : query.id
    };
});


const mapDispatchToProps = (dispatch) => {
    return {
    }
}
function mapStateToProps(state,ownProps) {
   return {
   }
}

export default connect(mapStateToProps,mapDispatchToProps)(ClubView)
