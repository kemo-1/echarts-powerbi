import React from "react";

import * as echarts from "echarts";
import { toJson } from 'really-relaxed-json';

import ace from 'brace';
import { Viewer } from "./View";
import { getTheFirstDataset } from "./utils";
require('brace/mode/json');
// require('brace/theme/monokai');

const toolBarHeight = 25;
const statusBarHeight = 25;


export interface EditorProps {
    width: number;
    height: number;
    echartJson?: string;
    dataset: echarts.EChartOption.Dataset | echarts.EChartOption.Dataset[];
    onSave: (echartJson: string) => void; 
}

/* eslint-disable max-lines-per-function */
export const Editor: React.FC<EditorProps> = ({ height, width, echartJson, dataset, onSave }) => {

    const [previewMode, setPreviewMode] = React.useState<boolean>(false);

    const mainDiv = React.useRef<HTMLDivElement>();
    const chart = React.useRef<echarts.EChartsType>();
    const editorDiv = React.useRef<HTMLDivElement>();
    const editor = React.useRef<ace.Editor>();

    const message = React.useRef<HTMLParagraphElement>();

    const notifySave = React.useCallback(() => {
        if (message.current) {
            message.current.textContent = 'Saved...';

            setTimeout(() => {
                if (message.current?.textContent === 'Saved...') {
                    message.current.textContent = ''
                }
            }, 10000);
        }
    }, [message]);
    
    React.useEffect(() => {
        if (editorDiv.current) {
            const ds = getTheFirstDataset(dataset);
            const theFirstRow = ds.source[0];
            if (theFirstRow) {
                // theFirstRow.forEach(val => {
                    
                // });
            }

            let value;
            try {
                const json = toJson(echartJson);
                // optimize
                value = JSON.parse(json);
                value = JSON.stringify(value, null, ' ');
            } catch(e) {
                value = echartJson;
            }

            editor.current = ace.edit(editorDiv.current);
            editor.current.setValue(value);
            editor.current.getSession().setMode('ace/mode/json');
            editor.current.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true
            });

            editor.current.commands.addCommand({
                name: 'save', // название команды
                bindKey: {win: 'Ctrl-S',  mac: 'Command-S'}, // вызов на PC и Mac
                exec: function(editor) {
                    const value = editor.getValue()
                    onSave(value);

                    notifySave();
                },
                readOnly: false
            });
            editor.current.commands.addCommand({
                name: 'preview', // название команды
                bindKey: {win: 'Ctrl-P',  mac: 'Command-P'}, // вызов на PC и Mac
                exec: function( ) {
                    setPreviewMode(true);
                },
                readOnly: false
            });
        }
        return () => {
            editor.current.destroy();
        }
    }, []);

    const onSaveButtonClick = React.useCallback(() => {
        if (!editor.current) {
            return;
        }
        let value = editor.current.getValue();

        try {
            const json = toJson(echartJson);
            // optimize
            const chart = JSON.parse(json);
            const ds = getTheFirstDataset(dataset);
            chart.dataset = {
                source: [ds.source[0]]
            }
            value = JSON.stringify(chart);
        } catch (e) {
            console.warn('Parsing chema error', e);
        }
        onSave(value);
        notifySave();
    }, [editor.current]);

    const onChangeView = React.useCallback(() => {
        setPreviewMode(!previewMode);
    }, [previewMode]);

    return (
        <>
            <div className="editor">
                <div
                    style={{
                        height: `${toolBarHeight}px`,
                    }}
                    className="toolbar">
                    <button onClick={onSaveButtonClick}>
                        Save
                    </button>
                    <button onClick={onChangeView}>
                        {previewMode ? 'Editor' : 'Preview'}
                    </button>
                </div>
                <div
                    ref={editorDiv}
                    id="editor"
                    style={{
                        height: `${height - toolBarHeight - statusBarHeight}px`,
                        width: `${width}px`,
                        display: previewMode ? 'none' : 'block'
                    }}
                ></div>
                { previewMode ? <Viewer
                    dataset={dataset}
                    height={height - toolBarHeight}
                    width={width}
                    echartJSON={editor.current?.getValue() || '{}'}
                /> : null }
                <div
                    style={{
                        height: `${statusBarHeight}px`,
                    }}
                    className="statusbar">
                    <p 
                        className="message"
                        ref={message}>
                            Status
                    </p>
                </div>
            </div>
        </>
    );
};

