import React from 'react';

import {wrapper} from 'redux/store';
import Head from 'next/head'
import autobind from 'autobind-decorator'

import PageWrapper from 'components/pagewrapper'

import withTranslate from 'hocs/translate';

import EditorView from 'components/common/editorview'

import GalleryView from 'components/gallery/view'
import RoadmapOne from 'components/roadmap/one'
import CreatorOne from 'components/creator/one'
import Cal from 'components/time/cal'

import withClubView from 'hocs/clubview'

import { StatusOnlineIcon } from '@heroicons/react/outline';

import { atcb_action } from 'add-to-calendar-button'
import 'add-to-calendar-button/assets/css/atcb.min.css';
import { BellIcon } from '@heroicons/react/outline';
import Countdown from 'react-countdown';
import config from 'helper/config'

import {autoDecimal,percentDecimal} from 'helper/number'
import Showtime from 'components/time/showtime'

@withTranslate
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

    @autobind
    getCalendarTitle(time_type = 'whitelist') {
        const {club} = this.props;
        const {t} =  this.props.i18n;
        switch(time_type) {
            case 'whitelist':
                return club.get('name') + ' ' + t('whitelist mint begin');
            case 'public':
                return club.get('name') + ' ' + t('public mint begin');
            default:
                return '';
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
        const {is_public} = this.state;
        const {club,club_id} = this.props;


        if (!club) {
            return <PageWrapper>
                <Head>
                    <title>{'Drop details'}</title>
                </Head>
                <div>
                    <div className="max-w-screen-xl mx-auto pb-32">

                    </div>
                </div>
            </PageWrapper>
        }

        let mint_url = this.getMintUrl();

        let contract = club.get('contract');

        return <PageWrapper>
            <Head>
                <title>{'Drop details'}</title>
            </Head>
            <div>
                <div className="max-w-screen-xl mx-auto pb-32">

                    <div className='flex justify-start items-center my-8 text-black'>
                        <StatusOnlineIcon className='h-8 w-8 mr-2' /><h2 className='h2'>{t('live now')}</h2>
                    </div>
                    
            
                    <div className='p-6 bg-white mb-8 flex justify-start'>
                        <div className='w-96 h-96 overflow-hidden mr-6'>
                            <GalleryView gallery={club.get('gallery')} club_id={club_id} />
                        </div>
                        <div className='flex-grow'>
                            <div className='border border-black'>
                                <div className='p-4 border-b border-black'>
                                    <div>collection</div>
                                    <div className='h1'>{club.get('name')}</div>
                                </div>
                                {
                                    (contract && contract.get('wl_enable'))
                                    ?   <div className='flex justify-between border-b border-black'>
                                        <div className='w-1/2 box-one border-r border-black'>
                                            <div className='lb'>Whitelist presale starts in</div>
                                            <div className='ma flex justify-start items-center'>
                                                {
                                                    (contract.get('wl_start_time'))
                                                    ? <>
                                                    <Countdown date={contract.get('wl_start_time')} />
                                                    <span className='ml-4'>
                                                        <Cal begin_time={contract.get('wl_start_time')} 
                                                            text={this.getCalendarTitle('whitelist')} 
                                                            details={'url:'+mint_url} />
                                                    </span>
                                                    </>
                                                    : t('not set yet')
                                                }
                                            </div>
                                        </div>
                                        <div className='w-1/2 box-one'>
                                            <div className='lb'>Mint price</div>
                                            <div className='ma'>
                                                {
                                                    (contract.get('wl_price'))
                                                    ? <>
                                                        <span>{autoDecimal(contract.get('wl_price'))}</span>
                                                        <span className='text-base ml-2'>ETH</span>
                                                    </>
                                                    : t('not set yet')
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    : null
                                }
                                {
                                    (contract && contract.get('pb_enable'))
                                    ?   <div className='flex justify-between border-b border-black'>
                                        <div className='w-1/2 box-one border-r border-black'>
                                            <div className='lb'>{t('public sale starts in')}</div>
                                            <div className='ma flex justify-start items-center'>
                                                {
                                                    (contract.get('pb_start_time'))
                                                    ? <>
                                                        <Countdown date={contract.get('pb_start_time')} />
                                                        <span className='ml-4'>
                                                            <Cal begin_time={contract.get('wl_start_time')} 
                                                                text={this.getCalendarTitle('whitelist')} 
                                                                details={'url:'+mint_url} />
                                                        </span>
                                                    </>
                                                    : 'not set yet'
                                                }
                                            </div>
                                        </div>
                                        <div className='w-1/2 box-one'>
                                            <div className='lb'>{t('mint price')}</div>
                                            <div className='ma'>
                                                {
                                                    (contract.get('pb_price'))
                                                    ? <>
                                                        <span>{autoDecimal(contract.get('pb_price'))}</span>
                                                        <span className='text-base ml-2'>ETH</span>
                                                    </>
                                                    : 'not set yet'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    : <div className='flex justify-between border-b border-black'>
                                        <div className='w-1/2 box-one border-r border-black'>
                                            <div className='lb'>{t('public sale starts in')}</div>
                                            <div className='ma'>
                                                {t('not set yet')}
                                            </div>
                                        </div>
                                        <div className='w-1/2 box-one'>
                                            <div className='lb'>{t('mint price')}</div>
                                            <div className='ma'>
                                                {t('not set yet')}
                                            </div>
                                        </div>
                                    </div>
                                }
                                

                                <div className='flex justify-between items-center p-4'>
                                    <button className='btn btn-primary btn-block'>MINT</button>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className='mb-8 w-full p-6 bg-white'>
                        <div className='block-title'>{t('about')}</div>

                        <div className='grid grid-cols-12 gap-8'>
                            <div className="col-span-6">
                                <div className='border border-black border-b-0'>

                                    <div className='border-b border-black flex justify-between'>
                                        <div className="w-1/2 box-one border-r border-black">
                                            <div className='lb'>collection size</div>
                                            <div className='ma'>
                                                {contract.get('max_supply')}
                                            </div>
                                        </div>
                                        <div className="w-1/2 box-one">
                                            <div className='lb'>1/1</div>
                                            <div className='ma'>
                                                {contract.get('special_supply')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='border-b border-black'>
                                        <div className="box-one">
                                            <div className='lb'>blockchain</div>
                                            <div className='ma'>
                                            Ethereum
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        (contract.get('wl_enable'))
                                        ? <div className='border-b border-black flex justify-between'>
                                            <div className="w-1/2 box-one border-r border-black">
                                                <div className='lb'>{t('whitelist spot')}</div>
                                                <div className='ma'>
                                                    {contract.get('wl_max_supply')}
                                                </div>
                                            </div>
                                            <div className="w-1/2 box-one">
                                                <div className='lb'>{t('presale price')}</div>
                                                <div className='ma'>
                                                    {autoDecimal(contract.get('wl_price'))}
                                                    <span className='ml-2 text-base'>ETH</span>
                                                </div>
                                            </div>
                                        </div>
                                        : null
                                    }
                                    {
                                        (contract.get('pb_enable'))
                                        ? <div className='border-b border-black flex justify-between'>
                                            <div className="w-1/2 box-one border-r border-black">
                                                <div className='lb'>{t('public sale supply')}</div>
                                                <div className='ma'>
                                                    {
                                                        Number(contract.get('max_supply'))
                                                        -
                                                        Number(contract.get('wl_max_supply'))
                                                    }
                                                </div>
                                            </div>
                                            <div className="w-1/2 box-one">
                                                <div className='lb'>{t('public sale price')}</div>
                                                <div className='ma'>
                                                    {autoDecimal(contract.get('pb_price'))}
                                                    <span className='ml-2 text-base'>ETH</span>
                                                </div>
                                            </div>
                                        </div>
                                        : null
                                    }
                                    {
                                        (contract.get('wl_enable') && Number(contract.get('wl_start_time')) > 0)
                                        ? <div className='border-b border-black flex justify-between'>
                                            <div className="box-one w-full">
                                                <div className='lb'>{t('whitelist presale starts')}</div>
                                                <div className='ma flex justify-start items-center'>
                                                    <Showtime unixtime={contract.get('wl_start_time')} cale={true} />
                                                    <span className='ml-4'>
                                                        <Cal begin_time={contract.get('wl_start_time')} 
                                                            text={this.getCalendarTitle('whitelist')} 
                                                            details={'url:'+mint_url} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        : null
                                    }
                                    {
                                        (contract.get('pb_enable')  && Number(contract.get('pb_start_time')) > 0)
                                        ? <div className='border-b border-black flex justify-between'>
                                            <div className="box-one w-full">
                                                <div className='lb'>{t('public sale starts')}</div>
                                                <div className='ma flex justify-start items-center'>
                                                    <Showtime unixtime={contract.get('pb_start_time')} cale={true} />
                                                    <span className='ml-4'>
                                                        <Cal begin_time={contract.get('wl_start_time')} 
                                                            text={this.getCalendarTitle('public')} 
                                                            details={'url:'+mint_url} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        : null
                                    }
                                    {
                                        (Number(contract.get('reveal_time')) > 0)
                                        ? <div className='border-b border-black flex justify-between'>
                                            <div className="box-one w-full">
                                                <div className='lb'>{t('reveal in')}</div>
                                                <div className='ma'>
                                                    <Showtime unixtime={contract.get('reveal_time')} cale={true} />
                                                </div>
                                            </div>
                                        </div>
                                        : null
                                    }

                                </div>

                            </div>
                            <div className="col-span-6">
                                <EditorView content={club.get('introduction')} />
                            </div>
                        </div>

                    </div>

                    <div className='p-6 pt-4 bg-white mb-8'>
                        <div className='block-title'>{t('creator')}</div>
                        <div className='grid grid-cols-2 gap-5'>
                            {club.get('creator').map((one,index) => <CreatorOne 
                                key={one.id} 
                                id={index}
                                club={club}
                                creator={one}
                            />)}
                        </div>
                    </div>

                    <div className='p-6 pt-4 bg-white mb-8'>
                        <div className='block-title'>{t('roadmap')}</div>

                        <div>
                            
                            {club.get('roadmap').map((one,index) => <RoadmapOne 
                                key={one.id} 
                                id={index}
                                roadmap={one}
                            />)}

                        </div>

                    </div>

                    {
                        (contract.get('refund').count() > 0)
                        ?   <div className='p-6 pt-4 bg-white mb-8'>
                            <div className='block-title'>{t('refund')}</div>

                            <div>
                                
                                {contract.get('refund').map((one,index) => {
                                    console.log('one',one.toJS(),index);
                                    return <div className='flex justify-start border border-black'>
                                        <div className='p-4 border-r border-black'>
                                            <label>{t('locked ends in')}</label>
                                            <Showtime unixtime={one.get('end_time')} cale={true} />
                                        </div>
                                        <div className='p-4'>
                                            <label>{t('refundable rate')}</label>
                                            <div>{percentDecimal(one.get('refund_rate'))}%</div>
                                        </div>
                                    </div>
                                })}

                            </div>

                        </div>
                        : null
                    }



                </div> 
            </div>
    </PageWrapper>
    }
    
}

ClubView.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    return {
        club_id : query.id,
        address : (query.address) ? query.address : null
    };
});




export default ClubView
