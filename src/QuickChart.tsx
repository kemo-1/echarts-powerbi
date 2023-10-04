import React from "react";

import * as echarts from "echarts";

import powerbiApi from "powerbi-visuals-api";
import DataView = powerbiApi.DataView;

import { ErrorViewer } from "./Error";

import { Breadcrumb, Button, Layout, Menu, MenuProps, theme } from 'antd';
import { applyMapping, getChartColumns, verifyColumns } from "./utils";
import { Mapping } from "./Mapping";
import { Viewer } from "./View";

import { schemas } from './charts';

const { Header, Content, Sider, Footer } = Layout;

const chartTree = {
    'Line': [
        'Basic Line Chart',
        'Smoothed Line Chart',
        'Basic area chart',
        'Stacked Area Chart',
        'Bump Chart (Ranking)'
    ],
    'Bar': [
        'Basic Bar',
        'Bar with Background',
        'Axis Align with Tick',
        'Waterfall Chart',
        'Bar Chart with Negative Value',
        'Bar Label Rotation',
        'Stacked Horizontal Bar',
        'Stacked Bar Chart on Polar'
    ],
    'Pie': [
        'Doughnut Chart',
        'Half Doughnut Chart'
    ],
    'Scatter': [

    ],
    'Candlestick': [

    ],
    'Radar': [

    ],
    'Boxplot': [

    ],
    'Heatmap': [

    ],
    'Tree': [

    ],
    'Treemap': [

    ],
    'Sunburst': [

    ],
    'Sankey': [

    ],
    'Funnel': [

    ],
    'Gauge': [

    ],
}


export interface QuickChartProps {
    width: number;
    height: number;
    dataset: echarts.EChartOption.Dataset;
    dataView: DataView;
    onSave: (json: string) => void;
}

/* eslintd-isable max-lines-per-function */
export const QuickChart: React.FC<QuickChartProps> = ({ height, width, dataset: visualDataset, dataView, onSave }) => {

    const [error, setError] = React.useState<string>(null);
    const [schema, setSchema] = React.useState<string>(schemas['Basic Line Chart']);

    const chartGroups: MenuProps['items'] = Object.keys(chartTree).map(
        (group) => {
            return {
                key: group,
                label: `${group}`,

                children: chartTree[group].map((chart, j) => {
                    return {
                        key: chart,
                        label: `${chart}`,
                    };
                }),
            };
        },
    );

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const chartColumns = getChartColumns(schema);
    const unmappedColumns = verifyColumns(schema, chartColumns, []/*to get all columns for mapping*/);

    const mappingIsCorrect = verifyColumns(schema, chartColumns, dataView.metadata.columns).length === 0;

    const dataset = mappingIsCorrect ? visualDataset : JSON.parse(schema).dataset;

    return (
        <>
            {error ? (
                <>
                    <ErrorViewer error={error} height={height} width={width} json={schema} />
                </>
            ) : (
                <>
                    <Layout style={{ height: '100%', background: 'transparent'}}>
                        <Sider width={200} style={{ background: colorBgContainer, overflowY: 'scroll' }}>
                            <Button style={{width: '100%', marginBottom: '10px'}} type="primary" onClick={() => {
                                onSave(schema);
                            }}>
                                Save
                            </Button>
                            <Menu
                                mode="inline"
                                defaultSelectedKeys={['1']}
                                defaultOpenKeys={['sub1']}
                                style={{ height: '100%', borderRight: 0 }}
                                items={chartGroups}
                                onClick={(info) => {
                                    if (schemas[info.key]) {
                                        setSchema(schemas[info.key]);
                                    }
                                }}
                            />
                        </Sider>
                        <Layout style={{ padding: '0 0 15px 0', overflowY: 'auto', background: 'transparent' }}>
                            <Content
                                style={{
                                    padding: 24,
                                    margin: 0,
                                    minHeight: 280,
                                    background: colorBgContainer,
                                }}
                            >
                                <h4>Preview</h4>
                                <Viewer
                                    dataset={dataset}
                                    height={height * (2/3)}
                                    width={width - 300}
                                    echartJSON={schema}
                                />
                                {unmappedColumns.length ? (<>
                                    <h4>Mapping</h4>
                                    <Mapping
                                        dataView={dataView}
                                        dataset={visualDataset}
                                        unmappedColumns={unmappedColumns}
                                        onSaveMapping={(mapping) => {
                                            const mappedJSON = applyMapping(schema, mapping, visualDataset);
                                            setSchema(mappedJSON);
                                        }}
                                    />
                                </>) : null}
                            </Content>
                        </Layout>
                    </Layout>
                </>
            )}

        </>
    );
};
