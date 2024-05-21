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
import { hardReset, registerGlobal } from "./handlebars/helpers";
import { useAppSelector } from "./redux/hooks";

import "./handlebars/helpers";

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

// import { transform } from 'echarts-stat';
// echarts.registerTransform(transform.histogram);

const { Header, Content, Sider, Footer } = Layout;

const chartTree = {
    'Line': [
        'Basic Line Chart',
        'Smoothed Line Chart',
        'Basic area chart',
        'Stacked Area Chart'
    ],
    'Bar': [
        'Basic Bar Chart',
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
        'Scatter',
    ],
    'Candlestick': [
        'Basic Candlestick',
    ],
    'Radar': [
        'Basic Radar Chart'
    ],
    'Boxplot': [
        'Basic Boxplot',
    ],
    'Heatmap': [
        'Basic Heatmap'
    ],
    'Tree': [
        'Basic Tree',
    ],
    'Treemap': [
        'Basic Treemap',
    ],
    'Sunburst': [
        'Basic Sunburst',
    ],
    'Sankey': [
        'Basic Sankey',
    ],
    'Funnel': [
        'Basic Funnel',
    ],
    'Gauge': [
        'Basic Gauge',
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
    const [schema, setSchema] = React.useState<string>(JSON.stringify(schemas['Basic Line Chart'], null, " "));
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
        registerGlobal('table', table)
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
                                    height={height * (9/10)}
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
                                <h4>Configuration</h4>
                                <AceEditor
                                    width="100%"
                                    height={`${height * (9/10)}px`}
                                    mode="ace/mode/json"
                                    theme="github"
                                    onChange={(edit) => {
                                        console.log(edit);
                                    }}
                                    value={schema}
                                    name="CONFIGURATION_ID"
                                    editorProps={{ $blockScrolling: true }}
                                />
                            </Content>
                        </Layout>
                    </Layout>
                </>
            )}

        </>
    );
};
