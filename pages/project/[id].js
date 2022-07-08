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
import WhitelistCheck from 'components/whitelist/check'
import WhitelistCheckAuto from 'components/whitelist/check_auto'
import RefundModal from 'components/refund/modal'

import { StatusOnlineIcon } from '@heroicons/react/outline';

// import { atcb_action } from 'add-to-calendar-button'
// import 'add-to-calendar-button/assets/css/atcb.min.css';
import { DotsVerticalIcon,CurrencyDollarIcon} from '@heroicons/react/outline';
import Countdown from 'react-countdown';
import config from 'helper/config'

import {autoDecimal,percentDecimal} from 'helper/number'
import Showtime from 'components/time/showtime'
import { getUnixtime } from 'helper/time';

import {t} from 'helper/translate'
import withWallet from 'hocs/wallet';

@withTranslate
@withClubView
@withWallet
class ClubView extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            is_public : false,
            show_refund_modal : false
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
    toggleRefundModal() {
        this.setState({
            show_refund_modal : !this.state.show_refund_modal
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
        // const {t} = this.props.i18n;
        const {is_public} = this.state;
        const {club,club_id,wallet} = this.props;


        if (!club || !club.get('is_detail')) {
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
        let now_unixtime = getUnixtime();

        console.log('wl_start_time',contract.get('wl_start_time'))

        return <PageWrapper>
            <Head>
                <title>{'Drop details'}</title>
            </Head>
            <div>
                <div className="max-w-screen-xl mx-auto pb-32 pt-8">

                    <div className='flex justify-start items-center mb-4'>
                        <StatusOnlineIcon className='h-8 w-8 mr-2' /><h2 className='h2'>{t('live now')}</h2>
                    </div>
                    
            
                    <div className='p-6 d-bg-c-1 mb-8 flex justify-start border-4 border-black'>
                        <div className='w-96 h-96 overflow-hidden mr-6'>
                            <GalleryView gallery={club.get('gallery')} club_id={club_id} />
                        </div>
                        <div className='flex-grow'>
                            <div className=''>
                                <div className='mb-4 py-4 border-b d-border-c-3'>
                                    <div className='h1'>{club.get('name')}</div>
                                </div>
                                {
                                    (contract && contract.get('wl_enable'))
                                    ?   <div className='flex justify-between '>
                                        <div className='w-1/2 box-one '>
                                            <div className='lb'>{t('whitelist presale starts in')}</div>
                                            <div className='ma flex justify-start items-center'>
                                                {
                                                    (contract.get('wl_start_time'))
                                                    ? <>
                                                    <Countdown date={contract.get('wl_start_time')*1000} />
                                                    <span className='ml-4 flex-item-center'>
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
                                            <div className='lb'>{t('whitelist presale price')}</div>
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
                                <div className='flex justify-between '>
                                    <div className='w-1/2 box-one '>
                                        <div className='lb'>{t('minted / whitelist supply')}</div>
                                        <div className='ma flex justify-start items-center'>
                                            0 / {contract.get('wl_max_supply')}
                                        </div>
                                    </div>
                                    <div className='w-1/2 box-one '>
                                        <div className='lb'>{t('total supply')}</div>
                                        <div className='ma flex justify-start items-center'>
                                            {contract.get('max_supply')}
                                        </div>
                                    </div>
                                </div>
                                {
                                    (contract && contract.get('pb_enable'))
                                    ?   <div className='flex justify-between '>
                                        <div className='w-1/2 box-one '>
                                            <div className='lb'>{t('public sale starts in')}</div>
                                            <div className='ma flex justify-start items-center'>
                                                {
                                                    (contract.get('pb_start_time') > 0)
                                                    ? <>
                                                        {
                                                            (contract.get('pb_enable') && now_unixtime > Number(contract.get('wl_start_time')))
                                                            ? <Countdown date={contract.get('pb_start_time')*1000} />
                                                            : <>

                                                                <Showtime unixtime={contract.get('pb_start_time')} cale={true} />
                                                                <span className='ml-4 flex-item-center'>
                                                                    <Cal begin_time={contract.get('pb_start_time')} 
                                                                        text={this.getCalendarTitle('public')} 
                                                                        details={'url:'+mint_url} />
                                                                </span>
                                                            </>
                                                        }
                                                    </>
                                                    : 'not set yet'
                                                }
                                            </div>
                                        </div>
                                        <div className='w-1/2 box-one'>
                                            <div className='lb'>{t('public sale price')}</div>
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
                                    : <div className='flex justify-between '>
                                        <div className='w-1/2 box-one '>
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
                                

                                <div className='flex justify-between items-center py-4 border-t d-border-c-3'>
                                    <button className='btn btn-primary btn-wide capitalize'>mint</button>
                                    <button className='btn btn-primary btn-wide capitalize' disabled={true}>mint</button>

                                </div>

                            </div>
                        </div>
                    </div>
                    <div className='mb-8 w-full p-6 d-bg-c-1'>
                        <div className='block-title'>{t('whitelist check')}</div>
                        <div className='grid grid-cols-2 gap-8'>
                            <WhitelistCheckAuto club_id={club_id} wallet={wallet}/>
                            <WhitelistCheck club_id={club_id}/>
                        </div>
                    </div>
                    <div className='mb-8 w-full p-6 d-bg-c-1'>
                        <div className='block-title'>{t('about')}</div>

                        <div className='grid grid-cols-12 gap-8'>
                            <div className="col-span-6 border-r d-border-c-3">
                                <table className='info-table'>
                                    <thead>
                                        <tr>
                                            <th colspan={2}>
                                                {t('basic')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='lttd'>
                                                {t('collection size')}
                                            </td>
                                            <td className='rctd'>
                                                {contract.get('max_supply')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='lttd'>
                                                1/1 NFT
                                            </td>
                                            <td className='rctd'>
                                                {contract.get('special_supply')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='lttd'>
                                                blockchain
                                            </td>
                                            <td className='rctd'>
                                                Ethereum
                                            </td>
                                        </tr>
                                    
                                        {
                                            (Number(contract.get('reveal_time')) > 0)
                                            ? <tr>
                                                <td className='lttd'>
                                                    {t('reveal in')}
                                                </td>
                                                <td className='rctd'>
                                                    <Showtime unixtime={contract.get('reveal_time')} cale={true} />
                                                </td>
                                            </tr>
                                            : null
                                        }

                                    </tbody>
                                </table>
                                {
                                    (contract.get('wl_enable'))
                                    ? <><table className='info-table'>
                                        <thead>
                                            <tr>
                                                <th colspan={2}>
                                                    {t('whitelist')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('whitelist spot')}
                                                </td>
                                                <td className='rctd'>
                                                    {contract.get('wl_max_supply')}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('whitelist presale price')}
                                                </td>
                                                <td className='rctd'>
                                                    {autoDecimal(contract.get('wl_price'))}
                                                    <span className='ml-2 text-base'>ETH</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('whitelist mint time')}
                                                </td>
                                                <td className='rctd'>
                                                    <Showtime unixtime={contract.get('wl_start_time')} cale={true} />
                                                    <span className='ml-4 flex-item-center'>
                                                        <Cal begin_time={contract.get('wl_start_time')} 
                                                            text={this.getCalendarTitle('whitelist')} 
                                                            details={'url:'+mint_url} />
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </>
                                    : null
                                }
                                {
                                    (contract.get('pb_enable'))
                                    ? <><table className='info-table'>
                                        <thead>
                                            <tr>
                                                <th colspan={2}>
                                                    {t('public sale')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('public sale price')}
                                                </td>
                                                <td className='rctd'>
                                                    {autoDecimal(contract.get('pb_price'))}
                                                    <span className='ml-2 text-base'>ETH</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='lttd'>
                                                    {t('public mint time')}
                                                </td>
                                                <td className='rctd'>
                                                    <Showtime unixtime={contract.get('pb_start_time')} cale={true} />
                                                    <span className='ml-4 flex-item-center'>
                                                        <Cal begin_time={contract.get('pb_start_time')} 
                                                            text={this.getCalendarTitle('public')} 
                                                            details={'url:'+mint_url} />
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    </>
                                    : null
                                }

                            </div>
                            <div className="col-span-6">
                                <EditorView content={club.get('introduction')} />
                            </div>
                        </div>

                    </div>

                    <div className='p-6 pt-4 d-bg-c-1 mb-8'>
                        <div className='block-title'>{t('creator')}</div>
                        <div className='grid grid-cols-2 gap-16'>
                            {club.get('creator').map((one,index) => <CreatorOne 
                                key={one.id} 
                                id={index}
                                club={club}
                                creator={one}
                            />)}
                        </div>
                    </div>

                    <div className='p-6 pt-4 d-bg-c-1 mb-8'>
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
                        ?   <div className='p-6 pt-4 d-bg-c-1 mb-8'>
                            <div className='block-title'>{t('refund')}</div>

                            <div className='grid grid-cols-2 gap-8'>
                                
                                <div>
                                {contract.get('refund').map((one,index) => {
                                    console.log('one',one.toJS(),index);
                                    return <div className='flex justify-start'>
                                        <div className='py-4 pr-8'>
                                            <label>{t('locked ends in')}</label>
                                            <div className='text-xl font-bold'>
                                            <Showtime unixtime={one.get('end_time')} cale={true} />
                                            </div>
                                        </div>
                                        <div className='py-4'>
                                            <label>{t('refundable rate')}</label>
                                            <div className='text-xl font-bold'>
                                                {percentDecimal(one.get('refund_rate'))}%
                                            </div>
                                        </div>
                                    </div>
                                })}
                                </div>
                                <div>
                                    <h3 className='h3 mb-2'>
                                        {t('refund introduction')}
                                    </h3>
                                    <div className='text-gray-500'>
                                        <p>
                                            小幽灵是一个NFT项目，起源于最早的一个素描头像的构思，后来决定于发型在ETH上的NFT中，慢慢的我们对这个项目开始了更长时间的设计，规划。
                                        </p>
                                        <p>
                                            从一开始我们就希望做一个高质量的NFT项目，吸取国产项目的教训，并用真正的设计和实力来Build一个足够好的项目。
                                        </p>
                                        <p>
                                            在这里描述中，我们就需要更长的字数来介绍了，但是我是在不知道写了点什么就多一些一些，希望是可以个可以的啊打算啊苏丹啊苏丹。描述的中东。
                                        </p>
                                    </div>
                                </div>

                            </div>

                        </div>
                        : null
                    }

                    <div className='p-6 pt-4 bg-white mb-8'>
                        <div className='block-title'>{t('My Nfts')}</div>
                        <div className='grid grid-cols-6 gap-8'>
                            <div className=''>
                                <div className='relative'>
                                    <img src="http://dev.static.manestudio.com/public/gallery/bd/fa/bdfa104a2a4247eadf396d1f31d9006b267a2bbe.png" />
                                    <div class="dropdown dropdown-right absolute right-1 top-1">
                                        <label tabindex="0" class="btn m-1 px-2 bg-transparent border-none text-gray-600 hover:text-black hover:bg-transparent">
                                            <DotsVerticalIcon className='icon-sm'/>
                                        </label>
                                        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-white rounded-box w-52 capitalize">
                                            <li><a onClick={this.toggleRefundModal}><CurrencyDollarIcon className="icon-sm" />{t('refund')}</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div>
                                    #1
                                </div>
                            </div>
                            <div className=''>
                                <div>
                                    <img src="http://dev.static.manestudio.com/public/gallery/fd/6b/fd6be03709cb57ede19a622ddeffff39a0d44a0c.png" />
                                </div>
                                <div>
                                    #2
                                </div>
                            </div>
                        </div>
                    </div>

                    <RefundModal visible={this.state.show_refund_modal} closeModal={this.toggleRefundModal}/>


                </div> 
            </div>
    </PageWrapper>
    }
    
}

ClubView.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    return {
        club_id : query.id,
        address : (query.address) ? query.address : ''
    };
});




export default ClubView
