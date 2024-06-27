/* eslint-disable max-lines-per-function */
import React from "react";
import Handlebars from "handlebars";
import JSON5 from 'json5'
import * as echarts from 'echarts';

import powerbiApi from "powerbi-visuals-api";
import DataView = powerbiApi.DataView;

import { ErrorViewer } from "./Error";

import { Button, Flex, Layout, Menu, MenuProps, theme } from 'antd';
import { applyMapping, getChartColumns, verifyColumns, uncommentCodeComments } from "./utils";
import { Mapping } from "./Mapping";
import { Viewer } from "./View";

import { schemas } from './charts';
import { hardReset, registerGlobal } from "./handlebars/helpers";
import { useAppSelector } from "./redux/hooks";

import "./handlebars/helpers";

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

import { transform } from 'echarts-stat';
echarts.registerTransform(transform.histogram);
echarts.registerTransform(transform.clustering);

const { Content, Sider } = Layout;

const chartTree = {
    'Current': [],
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
        'Half Doughnut Chart',
        'Half Pie Chart',
    ],
    'Scatter': [
        'Scatter',
        // 'Clustering Process'
    ],
    'Candlestick': [
        'Basic Candlestick',
    ],
    'Radar': [
        'Basic Radar Chart',
        'AQI - Radar'
    ],
    // 'Boxplot': [
    //     'Basic Boxplot',
    // ],
    'Heatmap': [
        'Basic Heatmap'
    ],
    // 'Tree': [
    //     'Basic Tree',
    // ],
    // 'Treemap': [
    //     'Basic Treemap',
    // ],
    // 'Sunburst': [
    //     'Basic Sunburst',
    // ],
    // 'Sankey': [
    //     'Basic Sankey',
    // ],
    // 'Funnel': [
    //     'Basic Funnel',
    // ],
    'Gauge': [
        'Basic Gauge',
    ],
    'Coming soon...': [
        'Boxplot',
        'Gauge',
        'Funnel',
        'Sankey',
        'Sunburst',
        'Treemap',
        'Tree',
        'Clustering Process'
    ]
}


export interface QuickChartProps {
    width: number;
    height: number;
    dataset: echarts.EChartOption.Dataset;
    dataView: DataView;
    current: string;
    onSave: (json: string) => void;
}

/* eslintd-isable max-lines-per-function */
export const QuickChart: React.FC<QuickChartProps> = ({ height, width, dataset: visualDataset, dataView, current, onSave }) => {

    const [error] = React.useState<string>(null);
    const defaultSchema = schemas['Current'] || schemas['Basic Line Chart'];
    const isString = typeof defaultSchema == 'string';
    const [schema, setSchema] = React.useState<string>(isString ? defaultSchema : JSON5.stringify(defaultSchema, null, " "));
    console.log('schema', schema);
    const host = useAppSelector((state) => state.options.host);

    const chartGroups: MenuProps['items'] = Object.keys(chartTree).map(
        (group) => {
            if (chartTree[group].length === 0)
            {
                return {
                    key: group,
                    label: `${group}`,
                };
            }
            return {
                key: group,
                label: `${group}`,

                children: chartTree[group].map((chart, j) => {
                    return {
                        key: chart,
                        label: `${chart}`,
                        disabled: group === 'Coming soon...',
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

    const dataset = mappingIsCorrect ? visualDataset : JSON5.parse(schema).dataset;
    const table = useAppSelector((state) => state.options.table);
    const viewport = useAppSelector((state) => state.options.viewport);

    const template = React.useMemo(() => {
        const charttmpl = uncommentCodeComments(schema);
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

    const draft = React.useRef<string>(schema);

    const onApplySchema = React.useCallback(() => {
        setSchema(draft.current);
    }, [setSchema]);

    console.log('content', content);

    return (
        <>
            {error ? (
                <>
                    <ErrorViewer error={error} height={height} width={width} json={content} />
                </>
            ) : (
                <>
                    <Layout style={{ height: '100%', background: 'transparent'}}>
                        <Sider className="card" width={200} style={{ background: colorBgContainer, overflowY: 'scroll' }}>
                                <Menu
                                    mode="inline"
                                    defaultSelectedKeys={['1']}
                                    defaultOpenKeys={['sub1']}
                                    style={{ height: '100%', borderRight: 0 }}
                                    items={chartGroups}
                                    onClick={(info) => {
                                        if (info.key === 'Current') {
                                            draft.current = current;
                                            setSchema(current);
                                        }
                                        else if (schemas[info.key]) {
                                            const isString = typeof schemas[info.key] == 'string';
                                            draft.current = isString ? (schemas[info.key] as string) : JSON5.stringify(schemas[info.key], null, " ");
                                            setSchema(draft.current);
                                        }
                                    }}
                                />
                        </Sider>
                        <Layout style={{ padding: '0 0 15px 0', overflowY: 'auto', background: 'transparent' }}>
                            <Content
                                style={{
                                    padding: 5,
                                    margin: 0,
                                    minHeight: 280,
                                    background: colorBgContainer,
                                }}
                            >
                                <div className="card">
                                    <Flex vertical={false}>
                                        <Button type="primary" onClick={() => {
                                            setSchema(draft.current);
                                            onSave(draft.current);
                                        }}>
                                            Save
                                        </Button>
                                        <Button className="apply" onClick={onApplySchema}>Apply</Button>
                                        <a className="docs-link" onClick={(e) => host.launchUrl('https://ilfat-galiev.im/docs/echarts-visual/')}>Documentation</a>
                                    </Flex>
                                </div>
                                <div className="card">
                                    <h4 className="card-title">Preview</h4>
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
                                </div>
                                <div className="card">
                                <h4 className="card-title">Configuration</h4>
                                <AceEditor
                                    width="100%"
                                    height={`${height * (9/10)}px`}
                                    mode="json"
                                    theme="github"
                                    onChange={(edit) => {
                                        draft.current = edit;
                                    }}
                                    setOptions={{
                                        useWorker: false
                                    }}
                                    value={schema}
                                    name="CONFIGURATION_ID"
                                    editorProps={{ $blockScrolling: true }}
                                />
                                </div>
                            </Content>
                        </Layout>
                    </Layout>
                </>
            )}

        </>
    );
};
