import React from 'react';

import powerbiApi from "powerbi-visuals-api";

import { Viewer } from './View';
import { Tutorial } from './Tutorial';
import { Mapping } from './Mapping';
import { QuickChart } from './QuickChart';
import Handlebars from "handlebars";
import JSON5 from 'json5'

import { useAppSelector, useAppDispatch } from './redux/hooks';
import { setSettings, reVerifyColumns } from './redux/slice';
import { IVisualSettings } from './settings';
import { applyMapping, uncommentCodeComments } from './utils';

import { hardReset, registerGlobal } from "./handlebars/helpers"
import { sanitizeHTML } from './utils'
import { helper } from 'echarts';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ApplicationProps {
}

/* eslint-disable max-lines-per-function */
export const Application: React.FC<ApplicationProps> = () => {

    const settings = useAppSelector((state) => state.options.settings);
    const option = useAppSelector((state) => state.options.options);
    const host = useAppSelector((state) => state.options.host);
    const selectionManager = useAppSelector((state) => state.options.selectionManager);

    const dataView = useAppSelector((state) => state.options.dataView);
    const viewport = useAppSelector((state) => state.options.viewport);
    
    const dataset = useAppSelector((state) => state.options.dataset);
    const unmappedColumns = useAppSelector((state) => state.options.unmappedColumns);
    const table = useAppSelector((state) => state.options.table);

    const chart = useAppSelector((state) => state.options.settings.chart.echart);
    
    const dispatch = useAppDispatch();

    const persistProperty = React.useCallback((json_string: string) => {
        const instance: powerbiApi.VisualObjectInstance = {
            objectName: "chart",
            selector: undefined,
            properties: {
                echart: json_string
            }
        };

        host.persistProperties({
            replace: [
                instance
            ]
        });
    }, [host])

    const template = React.useMemo(() => {
        const charttmpl = uncommentCodeComments(chart);
        return Handlebars.compile(charttmpl);
    }, [chart, settings])

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
    }, [host, table, viewport, template, settings])

    const onClickHandler = React.useCallback((params) => {
        selectionManager?.select(table.rows[params.dataIndex].selection, params.event.ctrlKey || params.event.metaKey);
    }, [host, table, dataset]);

    const onMouseOverHandler = React.useCallback((params) => {
        host.tooltipService.hide({ immediately: true, isTouchEvent: false });
        host.tooltipService.show({
            coordinates: [params.event.offsetX, params.event.offsetY],
            dataItems: params.dimensionNames.map((dm, index) => ({
                header: params.name ,
                displayName: dm,
                value: params.data[index],

            })),
            isTouchEvent: false,
            identities: [
                table.rows[params.dataIndex].selection
            ],
        });
    }, [host, table, dataset]);

    const onMouseOutHandler = React.useCallback(() => {
        host.tooltipService.hide({ immediately: false, isTouchEvent: false});
    }, [host, table, dataset]);

    if (!option || !settings) {
        return (<h1>Loading...</h1>)
    }

    if (option.editMode === powerbiApi.EditMode.Advanced && dataView && dataView.table) {
        return (
            <QuickChart
                dataset={dataset}
                height={option.viewport.height}
                width={option.viewport.width}
                dataView={dataView}
                current={chart}
                onSave={(json) => {
                    const newSettings: IVisualSettings = JSON5.parse(JSON5.stringify(settings));
                    newSettings.chart.echart = json;
                    dispatch(setSettings(newSettings));
                    persistProperty(json);
                }}
            />
        );
    }

    // if (option && unmappedColumns.length) {
    //     return (
    //         <Mapping
    //             dataView={dataView}
    //             dataset={dataset}
    //             unmappedColumns={unmappedColumns}
    //             onSaveMapping={(mapping) => {
    //                 const mappedJSON = applyMapping(settings.chart.echart, mapping, dataset);
    //                 const newSettings: IVisualSettings = JSON5.parse(JSON5.stringify(settings));
    //                 newSettings.chart.echart = mappedJSON;
    //                 dispatch(setSettings(newSettings));
    //                 dispatch(reVerifyColumns());
    //                 persistProperty(mappedJSON);
    //             }}
    //         />
    //     )
    // }

    if (!dataView || !dataView.categorical) {
        const categorical = dataView?.categorical;
        if (!dataView && !categorical || settings && settings.chart.echart === '{}') {
            return (
                <Tutorial
                    height={option.viewport.height}
                    width={option.viewport.width}
                    dataset={dataset}
                    host={host}
                />
            )
        }
    }

    return (
        <>
            <Viewer
                onClick={onClickHandler}
                onMouseOver={onMouseOverHandler}
                onMouseOut={onMouseOutHandler}
                dataset={dataset}
                height={option.viewport.height}
                width={option.viewport.width}
                echartJSON={content}
            />
        </>
    );
}
