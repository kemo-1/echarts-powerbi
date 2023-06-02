import React from "react";

import * as echarts from "echarts";

import { toJson, toJs } from 'really-relaxed-json';

export interface ViewerProps {
    width: number;
    height: number;
    // echart?: echarts.EChartOption;
    echartJSON: string;
    dataset: echarts.EChartOption.Dataset | echarts.EChartOption.Dataset[];
}

/* eslint-disable max-lines-per-function */
export const Viewer: React.FC<ViewerProps> = ({ height, width, echartJSON, dataset }) => {

    const mainDiv = React.useRef<HTMLDivElement>();
    const chart = React.useRef<echarts.EChartsType>();
    const echart = React.useRef<echarts.EChartOption>({}); 

    // Parse chart options
    React.useEffect(() => {
        try {
            const json = toJson(echartJSON);
            echart.current = JSON.parse(json);
            // echart = toJs(echartJSON);
            echart.current.dataset = dataset;
        } catch(e) {
            console.error(e);
            echart.current = {};
        }
    }, [echartJSON]);

    // Create the echarts instance
    React.useEffect(() => {
        chart.current = echarts.init(mainDiv.current, null, {
            height,
            width,
        });

        return () => {
            chart.current.dispose();
        };
    }, []);

    // Draw the chart
    React.useEffect(() => {
        chart.current.setOption(echart.current);
        console.log('options', echart.current);
    }, [echart, chart]);

    // handle resize
    React.useEffect(() => {
        chart.current?.resize({
            height,
            width
        })
    }, [height, width, chart, echart]);

    return (
        <>
            <div
                ref={mainDiv}
                id="main"
                style={{
                    height: `${height}px`,
                    width: `${width}px`,
                }}
            ></div>
        </>
    );
};
