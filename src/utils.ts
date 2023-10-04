import powerbiVisualsApi from "powerbi-visuals-api";


import { Config as DompurifyConfig } from "dompurify";
import { EChartOption, LineSeriesOption } from "echarts";

import Series = EChartOption.Series;

export const defaultDompurifyConfig = <DompurifyConfig>{
    SANITIZE_DOM: true,
    ALLOW_ARIA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_TAGS: ['b', 'sup', 'sub', 'br', 'i'],
    ALLOWED_ATTR: []
};

export function safeParse(echartJson: string): any {
    let chart: any = {};

    try {
        chart = echartJson ? JSON.parse(echartJson) : {};
    } catch(e) {
        console.log(e.message);
    }

    return chart;
}

export function getChartColumns(echartJson: string): string[] {
    if (!echartJson) {
        return [];
    }
    const chart = safeParse(echartJson);

    if (chart.dataset) {
        if (chart.dataset.dimensions && chart.dataset.dimensions instanceof Array) {
            const columns = [];
            chart.dataset.dimensions.forEach((dimension: string | Record<string, string>) => {
                if (typeof dimension === 'string') {
                    columns.push(dimension);
                } else {
                    columns.push(dimension.name);
                }
            });

            return columns;
        }
        if (chart.dataset.source[0]) {
            return chart.dataset.source[0];
        }
    }

    return [];
}

export function createDataset(dataView: powerbiVisualsApi.DataView | null) {
    const dataSources: echarts.EChartOption.Dataset | echarts.EChartOption.Dataset[] = {
        dimensions: [],
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
            const headers: string[] = [];
            powerbiColumns.forEach((powerbiColumn) => {
                headers.push(powerbiColumn.source.displayName);
            });
            if (dataSources.dimensions && dataSources.dimensions  instanceof Array) {
                dataSources.dimensions = headers;
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

    const table = dataView.table;

    if (table) {
        const powerbiColumns: powerbiVisualsApi.DataViewMetadataColumn[] = [].concat(table.columns || []);

        if (powerbiColumns[0]) {
            // create header 
            const headers: string[] = [];
            powerbiColumns.forEach((powerbiColumn) => {
                headers.push(powerbiColumn.displayName);
            });
            if (dataSources.dimensions && dataSources.dimensions  instanceof Array) {
                dataSources.dimensions = headers;
            }

            table.rows.forEach((row, index) => {
                const echartrow = [];

                powerbiColumns.forEach((col, colIndex) => {
                    const value = row[colIndex];
                    echartrow.push(value);
                });
                if (dataSources.source instanceof Array) {
                    dataSources.source.push(echartrow);
                }
            });
        }
    }

    return dataSources;
}

export function walk(key: string, tree: Record<string, unknown | unknown[]> | unknown, apply: (key: string, value: any) => void) {
    if (typeof tree !== 'object') {
        apply(key, tree);
        return;
    }
    for (const key in tree) {
        if (tree[key] instanceof Array) {
            const array = tree[key] as Array<unknown>;
            array.forEach((el, index) => {
                apply(index.toString(), el);
                walk(index.toString(), el, apply);
            });
        } else {
            apply(key, tree[key]);
            if (tree[key] instanceof Object) {
                walk(key, tree[key], apply);
            }
        }
        
    }
}

export function applyMapping(echartJson: string | undefined, mapping: Record<string, string>, dataset: echarts.EChartOption.Dataset) : string {
    const echart = safeParse(echartJson);
    
    if (echartJson && echartJson !== "{}") {
        walk(null, echart, (key: string, value: any) => {
            if (key === 'encode') {
                Object.keys(value).forEach(attr => {
                    value[attr] = mapping[attr];
                });
            }
        })
    }
    echart.dataset = {
        dimensions: dataset.dimensions
    };

    return JSON.stringify(echart);
}

export function verifyColumns(echartJson: string | undefined, chartColumns: string[], visualColumns: powerbiVisualsApi.DataViewMetadataColumn[]) : Record<string, string>[] {
    // TODO walk through tree to find encode
    const unmappedColumns = [];
    if (echartJson && echartJson !== "{}") {
        echartJson = safeParse(echartJson);
        walk(null, echartJson, (key: string, value: any) => {
            if (key === 'encode') {
                Object.keys(value).forEach(attr => {
                    const columnMapped = visualColumns.find(vc => vc.displayName === value[attr]);
                    if (!columnMapped) {
                        unmappedColumns.push({[attr]: value[attr]});
                    }
                });
            }
        })
    } else {
        // chartColumns.filter(ch => visualColumns.find(vc => vc.displayName === ch) === undefined);
        // old mapping 
    }
    return unmappedColumns;
}

export function verifyColumnsByType(options: EChartOption<Series>, visualColumns: powerbiVisualsApi.DataViewMetadataColumn[]) {

    const unmappedColumns: string[] = [];

    if (options.series) {
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