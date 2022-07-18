import React from 'react';

import {wrapper} from 'redux/store';
import autobind from 'autobind-decorator'
import withTranslate from 'hocs/translate';

import config from 'helper/config'

@withTranslate
class ClubView extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

 
    @autobind
    getMintUrl() {
        const {club_id} = this.props;
        return config.get('WEBSITE') + '/project/' +club_id
    }


    render() {
        const {t} = this.props.i18n;
        const {type} = this.props;

        let mint_url = this.getMintUrl();
        let cn;
        switch (type) {
            case 'type1':
                cn = 'btn-primary';
                break;
            case 'type2':
                cn = 'btn-outline';
                break;
            case 'type3':
                cn = 'btn-secondary';
                break;
            case 'type4':
                cn = 'btn-accent';
                break;
            default:
                cn = 'btn-primary'
        }


        return <div className='flex justify-start items-center py-0 w-full'>
            <a href={mint_url} target="_blank" className='w-full block'>
                <button className={'btn btn-block w-full capitalize ' + cn} >mint</button>
            </a>
        </div>
    }
    
}

ClubView.getInitialProps =  wrapper.getInitialPageProps((store) => async ({pathname, req, res,query}) => {
    return {
        club_id : query.id,
        type    : query.type
    };
});


export default ClubView



