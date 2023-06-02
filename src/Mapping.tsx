import React from "react";

import * as echarts from "echarts";

import powerbiApi from "powerbi-visuals-api";
import DataView = powerbiApi.DataView;

export interface MappingProps {
    width: number;
    height: number;
    dataset: echarts.EChartOption.Dataset | echarts.EChartOption.Dataset[] | null;
    dataView: DataView;
    unmappedColumns: string[];
}

/* eslint-disable max-lines-per-function */
export const Mapping: React.FC<MappingProps> = ({ height, width }) => {

    const mainDiv = React.useRef<HTMLDivElement>();

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
                <p>Mapping</p>
            </div>
        </>
    );
};
