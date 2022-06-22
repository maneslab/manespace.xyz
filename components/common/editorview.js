import React from 'react'
import dynamic from 'next/dynamic'
import 'braft-editor/dist/index.css'

import {
    convertRawToEditorState,
  } from 'braft-convert';
  

const BraftEditor = dynamic(() => import('braft-editor'), { ssr: false })

export default class Editor extends React.Component {



    getEditorState = (content) => {
        let editorState;
        if (content) {
            let json_content;
            if (typeof content == 'string') {
                json_content = JSON.parse(content);
            }else {
                json_content = content;
            }
            editorState = convertRawToEditorState(json_content);
        }else {
            editorState = null;
        }
        return editorState
    }


    render () {
        const {label,content} = this.props;

        let editorState = this.getEditorState(content);

        return (
            <div className="prose">
            <BraftEditor
                contentStyle={{height: 'auto', minHeight: 200}}
                contentClassName="prose max-w-full"
                language={'en'}
                controls={[
                ]}
                readOnly={true}
                value={editorState}
                // onChange={this.handleEditorChange}
                // onSave={this.submitContent}
                />
            </div>
        )

    }

}