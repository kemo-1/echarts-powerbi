import React from "react";

import { strings }  from "./strings";

export interface ErrorViewerProps {
    width: number;
    height: number;
    json: string;
    error: any;
}

/* eslint-disable max-lines-per-function */
export const ErrorViewer: React.FC<ErrorViewerProps> = ({ error, json }) => {

    return (
        <div className="errorView">
            <h3 className="errorHeader">{strings.error}</h3>
            <p  className="error">
                <pre>
                    {error}
                </pre>
            </p>
            <h3 className="jsonHeader">{strings.jsonOptions}</h3>
            <p className="json">
                <pre>
                    {json}
                </pre>
            </p>
        </div>
    );
};
