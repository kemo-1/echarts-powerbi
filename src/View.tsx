import React from "react";
import JSON5 from 'json5'
import * as echarts from "echarts";

import { ErrorViewer } from "./Error";
import Layout from "antd/es/layout/layout";

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
    const chartInstance = React.useRef<echarts.EChartsType>();
    const echart = React.useRef<echarts.EChartOption>({});
    
    const [error, setError] = React.useState<string>(null);
    const [parsingError, setParsingError] = React.useState<string>(null);

    // Parse chart options
    React.useEffect(() => {
        try {
            setParsingError(null);
            echart.current = JSON5.parse(echartJSON);
            echart.current.dataset = dataset;
        } catch(e) {
            setParsingError(e.message);
            console.error(e);
            echart.current = {};
        }
    }, [echartJSON, dataset, setParsingError]);

    // Create the echarts instance
    React.useEffect(() => {
        try {
            setError(null);
            chartInstance.current = echarts.init(mainDiv.current, null, {
                height,
                width,
            });

            chartInstance.current.on("click", (params) => {
                console.log('click', params, dataset);
            });

            chartInstance.current.on("mouseover", (params) => {
                console.log('mouseover', params, dataset);
            });
        }
        catch(e) {
            setError(e.message);
            console.error(e);
            echart.current = {};
        }

        return () => {
            chartInstance.current.dispose();
        };
    }, [echartJSON, setError]);

    // Draw the chart
    React.useEffect(() => {
        try {
            chartInstance.current.setOption(echart.current);
        } catch (e) {
            setError(e.message);
            console.log('parse error', e);
        }
    }, [echart, chartInstance, dataset, echartJSON, setError]);

    // handle resize
    React.useEffect(() => {
        chartInstance.current?.resize({
            height,
            width
        })
    }, [height, width, chartInstance, echart]);

    return (
        <>
            {parsingError ? (
            <>
                <ErrorViewer error={parsingError} height={height} width={width} json={echartJSON}/>
            </>
            ) : null }
            {error ? (
            <>
                <ErrorViewer error={error} height={height} width={width} json={echartJSON}/>
            </>
            ) : null }
            <Layout className={parsingError || error ? "hidden" : ""} style={{backgroundColor: 'transparent'}}>
                <div
                    ref={mainDiv}
                    id="main"
                    style={{
                        height: `${height}px`,
                        width: `${width}px`,
                    }}
                ></div>
            </Layout>
        </>
    );
};
