/* eslint-disable max-lines-per-function */
import React from "react";
import Handlebars from "handlebars";

import * as echarts from "echarts";

import powerbiApi from "powerbi-visuals-api";
import DataView = powerbiApi.DataView;

import { ErrorViewer } from "./Error";

import { Breadcrumb, Button, Layout, Menu, MenuProps, theme } from 'antd';
import { applyMapping, getChartColumns, verifyColumns } from "./utils";
import { Mapping } from "./Mapping";
import { Viewer } from "./View";

import { schemas } from './charts';
import { hardReset } from "./handlebars/helpers";
import { useAppSelector } from "./redux/hooks";

import "./handlebars/helpers";

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
    const [schema, setSchema] = React.useState<string>(JSON.stringify(schemas['Basic Line Chart']));
    const host = useAppSelector((state) => state.options.host);

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
    const table = useAppSelector((state) => state.options.table);
    const viewport = useAppSelector((state) => state.options.viewport);

    const template = React.useMemo(() => {
        let charttmpl = schema
        charttmpl = charttmpl.replaceAll('"{{{', " {{{ ")
        charttmpl = charttmpl.replaceAll('}}}"', " }}} ")
        console.log('charttmpl quick chart', charttmpl);
        return Handlebars.compile(charttmpl);
    }, [schema])

    const content = React.useMemo(() => {
        debugger;
        hardReset()
        Handlebars.unregisterHelper('useColor')
        Handlebars.registerHelper('useColor', function (val: string) {
            return host.colorPalette.getColor(val).value
        })
        Handlebars.unregisterHelper('useSelection')
        Handlebars.registerHelper('useSelection', function (index: number) {
            if (table[index] && typeof index === 'number') {
                return `data-selection=true data-index="${index}"`
            }
        })
        Handlebars.unregisterHelper('useSelectionClear')
        Handlebars.registerHelper('useSelectionClear', function () {
            return `data-selection-clear="true"`
        })
        try {
            return template({
                table,
                dataset,
                viewport
            })
        } catch (err) {
            return `<h4>${err.message}</h4><pre>${err.stack}</pre>`
        }
    }, [host, table, viewport, template])

    console.log('quick chart content', content);

    return (
        <>
            {error ? (
                <>
                    <ErrorViewer error={error} height={height} width={width} json={content} />
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
                                        setSchema(JSON.stringify(schemas[info.key], null, " "));
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
                                    echartJSON={content}
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
