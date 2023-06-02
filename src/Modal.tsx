import React from 'react';
import { Button } from "react-chart-editor";
import { strings } from './strings';

export const Modal: React.FC<{
    header?: string;
    visible: boolean,
    onCancel?: () => void;
    onOk?: () => void;
    children?: React.ReactNode;
}> = ({header, visible, children, onCancel, onOk}) => {
    if (!visible) {
        return null;
    }
    return (<>
        <div className='modal  editor_controls plotly-editor--theme-provider'>
            <div className='overlay'
                style={{
                    float: "right",
                    flexDirection: 'row-reverse'
                }}>
                <div className='container'>
                    <h1>{header}</h1>
                    {
                        children
                    }
                    <div className='bar'>
                        {onOk ? (
                            <Button
                                variant="primary"
                                className="confirm"
                                onClick={onOk} >
                                {strings.ok}
                            </Button>
                        ) : null}
                        {onCancel ? (
                            <Button
                                className="cancel"
                                onClick={onCancel} >
                                {strings.cancel}
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    </>);
};
