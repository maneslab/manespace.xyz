import React from 'react';

import autobind from 'autobind-decorator'
import {connect} from 'react-redux'

import withMustLogin from 'hocs/mustlogin';
import withTranslate from 'hocs/translate';
import { Carousel } from 'react-responsive-carousel';

import GalleryOne from 'components/gallery/one'

import Countdown from 'react-countdown';

import {loadGalleryList} from 'redux/reducer/gallery'
import { denormalize } from 'normalizr';
import {galleryListSchema} from 'redux/schema/index'
import { defaultListData } from 'helper/common';
import { BellIcon } from '@heroicons/react/outline';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

import { atcb_action } from 'add-to-calendar-button'
import 'add-to-calendar-button/assets/css/atcb.min.css';

@withTranslate
@withMustLogin
class GalleryUpdate extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            is_updating     : false,
            open_index      : null,
            draging_index   : null
        }
    }

    componentDidMount() {
        if (this.props.club_id) {
            this.props.loadGalleryList({
                'club_id'   :   this.props.club_id
            });
        }
        // 
    }

    componentDidUpdate(prevProps,prevState) {
        if (this.props.club_id && this.props.club_id != prevProps.club_id) {
            this.props.loadGalleryList({
                'club_id'   :   this.props.club_id
            });
        }
    }



    render() {
        const {t} = this.props.i18n;
        const {is_updating,open_index,draging_index} = this.state;
        const {club,gallery} = this.props;

        const customRenderThumb = (children) =>
            children.map((item) => {
                // console.log('item.props.img',item.props.img.toJS())
                // const videoId = getVideoId(item.props.url);
                return <img src={item.props.img.getIn(['img','image_urls','url'])} />;
            }
        );

       

        return  <div className='p-6 bg-white mb-8 flex justify-start
        '>
            <div className='w-96 mr-6'>
                <Carousel showArrows={true} onClickItem={this.onClickItem} onClickThumb={this.onClickThumb} renderThumbs={customRenderThumb}>
                {gallery.map((one,index) => <GalleryOne 
                    key={one.id} 
                    id={index}
                    img={one}
                />)}
                </Carousel>
            </div>
            <div className='border border-black flex-grow'>
                <div className='p-4 border-b border-black'>
                    <div>collection</div>
                    <div className='h1'>{club.get('name')}</div>
                </div>
                <div className='flex justify-between border-b border-black'>
                    <div className='w-1/2 box-one border-r border-black'>
                        <div className='lb'>Whitelist presale starts in</div>
                        <div className='ma'>
                            <Countdown date={Date.now() + 10000} />
                        </div>
                    </div>
                    <div className='w-1/2 box-one border-r border-black'>
                        <div className='lb'>Mint price</div>
                        <div className='ma'>
                        0.05 ETH
                        </div>
                    </div>
                </div>
                <div className='flex justify-between border-b border-black'>
                    <div className='w-1/2 box-one border-r border-black'>
                        <div className='lb'>Whitelist presale starts in</div>
                        <div className='ma'>
                            <Countdown date={Date.now() + 10000} />
                        </div>
                    </div>
                    <div className='w-1/2 box-one border-r border-black'>
                        <div className='lb'>Mint price</div>
                        <div className='ma'>
                        0.05 ETH
                        </div>
                    </div>
                </div>
                <div className='flex justify-between border-b border-black'>
                    <div className='w-1/2 box-one border-r border-black'>
                        <div className='lb'>Whitelist presale starts in</div>
                        <div className='ma'>
                            <Countdown date={Date.now() + 10000} />
                        </div>
                    </div>
                    <div className='w-1/2 box-one border-r border-black'>
                        <div className='lb'>Mint price</div>
                        <div className='ma'>
                        0.05 ETH
                        </div>
                    </div>
                </div>
                <div className='flex justify-between items-center border-b border-black p-4'>
                    <div className='flex-grow mr-4'>
                        <button className='btn btn-primary btn-block'>MINT</button>
                    </div>
                    <div className='pr-4'>
                        <a onClick={()=>{
                            atcb_action({
                                name : 'Google',
                                startDate: "2022-01-14",
                                endDate: "2022-01-18",
                                options: ['Apple', 'Google', 'iCal', 'Microsoft365', 'Outlook.com', 'MicrosoftTeams', 'Yahoo'],
                                trigger: "click",
                                iCalFileName: "Reminder-Event",
                            })
                        }}><BellIcon className='text-primary w-5 h-5' /></a>
                    </div>
                </div>
            </div>
        </div>

    }
    
}
const mapDispatchToProps = (dispatch) => {
    return {
        loadGalleryList : (data) => {
           return dispatch(loadGalleryList(data))
        },
    }
}
function mapStateToProps(state,ownProps) {

    let club_id = ownProps.club.get('id');
    let list_data = state.getIn(['gallery','list',club_id]);

    if (!list_data) {
        list_data = defaultListData
    }
    let gallery = denormalize(list_data.get('list'),galleryListSchema,state.get('entities'));

    return {
        gallery : gallery,
        list_data : list_data,
        club_id   : club_id
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(GalleryUpdate)