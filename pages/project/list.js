import React from 'react';

import {wrapper} from 'redux/store';
import Head from 'next/head'
import autobind from 'autobind-decorator'

import PageWrapper from 'components/pagewrapper'

import MyClubList from 'components/club/mylist'
import MyClubList2 from 'components/club/mylist2'

import withMustLogin from 'hocs/mustlogin';
import withTranslate from 'hocs/translate';

import { CollectionIcon,FireIcon } from '@heroicons/react/outline';

@withTranslate
class ClubList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }


    render() {
        const {t} = this.props.i18n;

        return <PageWrapper>
            <Head>
                <title>{'Project List'}</title>
            </Head>
            <div className="max-w-screen-xl mx-auto">

                <div className='flex justify-between items-center mb-4'>
                    <h2 className="h2 capitalize flex justify-start items-center"><FireIcon className="icon-sm mr-2" />{t('next up')}</h2>
                </div>
                <div className='mb-16'>
                    <MyClubList2 />
                </div>

                <div className='flex justify-between items-center mb-4'>
                    <h2 className="h2 capitalize flex justify-start items-center"><CollectionIcon className="icon-sm mr-2" />{t('more upcoming drops')}</h2>
                </div>
                <MyClubList />
            </div>
        </PageWrapper>
    }
    
}

ClubList.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    return {
    };
});

export default ClubList
