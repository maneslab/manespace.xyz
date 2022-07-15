import React from 'react';

import {wrapper} from 'redux/store';
import Head from 'next/head'
import autobind from 'autobind-decorator'
import classNames from 'classnames'

import PageWrapper from 'components/pagewrapper'

import ClubList from 'components/club/list'
import ClubList2 from 'components/club/list2'
import ClubWhitelistList  from 'components/club/whitelist_list'

import withTranslate from 'hocs/translate';

import { CollectionIcon,FireIcon } from '@heroicons/react/outline';
import withWallet from 'hocs/wallet';

@withTranslate
@withWallet
class ProjectList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            'list_type': 'all',
        }
    }

    @autobind
    onTabChange(name) {
        this.setState({
            'list_type': name,
        })
    }


    render() {
        const {t} = this.props.i18n;
        const {wallet} = this.props;
        const {list_type} = this.state;

        return <PageWrapper>
            <Head>
                <title>{'Project List'}</title>
            </Head>
            <div className="max-w-screen-xl mx-auto">

                <div className='flex justify-between items-center mb-4 pt-8'>
                    <h2 className="h2 capitalize flex justify-start items-center"><FireIcon className="icon-sm mr-2" />{t('next up')}</h2>
                    
                </div>
                <div className='mb-16'>
                    <ClubList2 address={wallet?wallet.address:''}/>
                </div>

                <div className='flex justify-between items-center mb-4'>
                    <h2 className="h2 capitalize flex justify-start items-center"><CollectionIcon className="icon-sm mr-2" />{t('more upcoming drops')}</h2>
                    <div className="block-tab">
                        <div className={classNames("tab-one",{"active":(list_type=='all')})} onClick={this.onTabChange.bind({},'all')}>{t('all')}</div> 
                        <div className={classNames("tab-one",{"active":(list_type=='whitelist')})} onClick={this.onTabChange.bind({},'whitelist')}>{t('whitelist')}</div> 
                    </div>
                </div>
                {
                    (list_type=='all')
                    ? <ClubList address={wallet?wallet.address:''} />
                    : <ClubWhitelistList address={wallet?wallet.address:''} />
                }
                
            </div>
        </PageWrapper>
    }
    
}

ProjectList.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    return {
    };
});

export default ProjectList
