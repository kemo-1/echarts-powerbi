import powerbiVisualsApi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbiVisualsApi.DataView;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost
import IViewport = powerbiVisualsApi.IViewport;

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { IVisualSettings, VisualSettings } from "../settings";
import { Table, convertData, createDataset, getChartColumns, verifyColumns } from "../utils";
import { EChartOption } from "echarts";

export interface VisualState {
    host: IVisualHost;
    options: VisualUpdateOptions;
    settings: IVisualSettings;
    viewport: IViewport;
    dataset: EChartOption.Dataset;
    table: Table;
    unmappedColumns: any[];
    dataView: DataView;
}

const initialState: VisualState = {
    host: undefined,
    options: undefined,
    settings: VisualSettings.getDefault() as VisualSettings,
    dataset: {},
    table: {
        columns: [],
        rows: []
    },
    unmappedColumns: [],
    dataView: null,
    viewport: {
        height: 0,
        width: 0
    }
}

export const slice = createSlice({
    name: 'options',
    initialState,
    reducers: {
        setHost: (state, action: PayloadAction<IVisualHost>) => {
            state.host = action.payload
        },
        setOptions: (state, action: PayloadAction<VisualUpdateOptions>) => {
            state.options = action.payload;
            if (!state.options.dataViews[0]) {
                return;
            }
            state.dataView = state.options.dataViews[0];
            state.dataset = createDataset(state.dataView);
            state.table = convertData(state.dataView);
            const chartColumns = getChartColumns(state.settings.chart.echart);
            state.unmappedColumns = chartColumns && state.dataView.metadata.columns ? verifyColumns(state.settings.chart.echart, chartColumns, state.dataView.metadata.columns) : [];
        },
        setSettings: (state, action: PayloadAction<IVisualSettings>) => {
            state.settings = action.payload;
        },
        setViewport: (state, action: PayloadAction<IViewport>) => {
            state.viewport = action.payload;
        }, 
        reVerifyColumns: (state) => {
            state.unmappedColumns = verifyColumns(state.settings.chart.echart, getChartColumns(state.settings.chart.echart), state.dataView.metadata.columns);
        }
    },
})

// Action creators are generated for each case reducer function
export const { setHost, setOptions, setViewport, setSettings, reVerifyColumns } = slice.actions

export default slice.reducer