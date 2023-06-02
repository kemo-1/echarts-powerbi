import powerbiVisualsApi from "powerbi-visuals-api";


import { Config as DompurifyConfig } from "dompurify";
import { toJson } from 'really-relaxed-json';
import { EChartOption, LineSeriesOption } from "echarts";

import Series = EChartOption.Series;

export const defaultDompurifyConfig = <DompurifyConfig>{
    SANITIZE_DOM: true,
    ALLOW_ARIA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_TAGS: ['b', 'sup', 'sub', 'br', 'i'],
    ALLOWED_ATTR: []
};

export function getChartColumns(echartJson: string) {
    if (!echartJson) {
        return [];
    }
    const json = toJson(echartJson);
    const chart = JSON.parse(json);
    if (chart.dataset) {
        if (chart.dataset.source[0]) {
            return chart.dataset.source[0];
        }
    }

    return [];
}

export function createDataset(dataView: powerbiVisualsApi.DataView | null) {
    const dataSources: echarts.EChartOption.Dataset | echarts.EChartOption.Dataset[] = {
        source: []
    };
    if (!dataView) {
        return dataSources
    }

    const categorical = dataView.categorical;

    if (categorical) {
        const powerbiColumns: powerbiVisualsApi.DataViewCategoryColumn[] | Array<powerbiVisualsApi.DataViewValueColumn>  = [].concat(categorical.categories || []).concat(categorical.values || []);

        if (powerbiColumns[0]) {
            // create header 
            const headers: powerbiVisualsApi.PrimitiveValue[] = [];
            powerbiColumns.forEach((powerbiColumn) => {
                headers.push(powerbiColumn.source.displayName);
            });
            if (dataSources.source instanceof Array) {
                dataSources.source.push(headers);
            }

            powerbiColumns[0].values.forEach((_value, rowIndex) => {
                const row = [];
                powerbiColumns.forEach((col, colIndex) => {
                    const value = powerbiColumns[colIndex].values[rowIndex];
                    row.push(value);
                });
                if (dataSources.source instanceof Array) {
                    dataSources.source.push(row);
                }
            });
        }

    }

    return dataSources;
}

export function verifyColumns(chartColumns: string[], visualColumns: powerbiVisualsApi.DataViewMetadataColumn[]) {
    return chartColumns.filter(ch => visualColumns.find(vc => vc.displayName === ch) === undefined);
}

export function verifyColumnsByType(options: EChartOption<Series>, visualColumns: powerbiVisualsApi.DataViewMetadataColumn[]) {

    const unmappedColumns: string[] = [];

    options.series.forEach(series => {
        if (series.type === 'line') {
            const line: LineSeriesOption = (series as LineSeriesOption);
            if (line.encode['x']) {
                if (visualColumns.find(vc => vc.displayName === line.encode['x'])) {
                    unmappedColumns.push(line.encode['x'] as string);
                }
            } 
        }
    });

}


export function getTheFirstDataset(dataset: echarts.EChartOption.Dataset | echarts.EChartOption.Dataset[]) : echarts.EChartOption.Dataset {
    let ds;
    if (dataset instanceof Array) {
        ds = dataset[0];
    } else {
        ds = dataset;
    }
    return ds;
}