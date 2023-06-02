import React from "react";

import * as echarts from "echarts";
import { getTheFirstDataset } from "./utils";

const addDataImage = require('../assets/add_data2.gif');
const openEditImage = require('../assets/open_edit.gif');


export interface TutorialProps {
    width: number;
    height: number;
    dataset: echarts.EChartOption.Dataset | echarts.EChartOption.Dataset[] | null;
}

/* eslint-disable max-lines-per-function */
export const Tutorial: React.FC<TutorialProps> = ({ height, width, dataset }) => {

    const mainDiv = React.useRef<HTMLDivElement>();

    const ds = React.useMemo(() => getTheFirstDataset(dataset), [dataset]);

    React.useEffect(() => {
        return () => {
            // 
        };
    }, []);

    // handle resize
    React.useEffect(() => {
        // 
    }, [height, width]);

    return (
        <>
            <div
                ref={mainDiv}
            >
                <p>Tutorial</p>
                {
                    ds.source instanceof Array && !ds.source?.length ||
                    !(ds.source instanceof Array) && !ds.source
                    ? 
                    (
                        <>
                            <h2>Assign data to the visual</h2>
                            <img src={addDataImage}></img>
                        </>
                    )
                    : null
                }
                {
                    ds.source instanceof Array && ds.source?.length ||
                    ds.source && !(ds.source instanceof Array)
                    ? 
                    (
                        <>
                            <h2>Source ready, let's configure the chart</h2>
                            <img src={openEditImage}></img>
                        </>
                    )
                    : null
                }
            </div>
        </>
    );
};

