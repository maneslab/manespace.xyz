import React from 'react';

import withMustLogin from 'hocs/mustlogin';
import withTranslate from 'hocs/translate';

import EditorView from 'components/common/editorview'

@withTranslate
@withMustLogin
class ClubUpdate extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }


    render() {
        const {t} = this.props.i18n;
        const {club} = this.props;


        return  <div className='mb-8 w-full p-6 bg-white '>
            <div className='block-title'>{t('about')}</div>
            <div className='-mx-3'>
            <EditorView content={club.get('introduction')} />
            </div>
        </div>

    }
    
}


export default ClubUpdate

