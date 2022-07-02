import React from 'react';

import { Carousel } from 'react-responsive-carousel';
import GalleryOne from 'components/gallery/one'

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

class GalleryView extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            is_updating     : false,
            open_index      : null,
            draging_index   : null
        }
    }

    render() {
        const {gallery} = this.props;

        const customRenderThumb = (children) =>
            children.map((item) => {
                // console.log('item.props.img',item.props.img.toJS())
                // const videoId = getVideoId(item.props.url);
                return <img src={item.props.img.getIn(['img','image_urls','url'])} />;
            }
        );

        return  <Carousel showArrows={true} onClickItem={this.onClickItem} onClickThumb={this.onClickThumb} >
            {gallery.map((one,index) => <GalleryOne 
                key={one.id} 
                id={index}
                img={one}
            />)}
        </Carousel>
    }
    
}

export default GalleryView