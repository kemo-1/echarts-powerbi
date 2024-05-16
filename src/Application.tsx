import React from 'react';

import powerbiApi from "powerbi-visuals-api";

import { Viewer } from './View';
import { Tutorial } from './Tutorial';
import { Mapping } from './Mapping';
import { QuickChart } from './QuickChart';
import Handlebars from "handlebars";

import { useAppSelector, useAppDispatch } from './redux/hooks';
import { setSettings, reVerifyColumns } from './redux/slice';
import { IVisualSettings } from './settings';
import { applyMapping } from './utils';

import { hardReset } from "./handlebars/helpers"
import { sanitizeHTML } from './utils'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ApplicationProps {
}

/* eslint-disable max-lines-per-function */
export const Application: React.FC<ApplicationProps> = () => {

    const settings = useAppSelector((state) => state.options.settings);
    const option = useAppSelector((state) => state.options.options);
    const host = useAppSelector((state) => state.options.host);

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
        let charttmpl = JSON.stringify(JSON.parse(chart), null, " ")
        charttmpl = charttmpl.replaceAll("\"{{{", "{{{")
        charttmpl = charttmpl.replaceAll("}}}\"", "}}}")
        return Handlebars.compile(charttmpl);
    }, [chart])

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

    if (!option || !settings || !dataView) {
        return (<h1>Loading...</h1>)
    }

    if (option.editMode === powerbiApi.EditMode.Advanced ||
        (content === '{}' && dataView && dataset)) {
        return (
            <QuickChart
                dataset={dataset}
                height={option.viewport.height}
                width={option.viewport.width}
                dataView={dataView}
                onSave={(json) => {
                    persistProperty(json);
                    const newSettings: IVisualSettings = JSON.parse(JSON.stringify(settings));
                    newSettings.chart.echart = json;
                    dispatch(setSettings(newSettings));
                }}
            />
        );
    }

    if (option && unmappedColumns.length) {
        return (
            <Mapping
                dataView={dataView}
                dataset={dataset}
                unmappedColumns={unmappedColumns}
                onSaveMapping={(mapping) => {
                    const mappedJSON = applyMapping(settings.chart.echart, mapping, dataset);
                    const newSettings: IVisualSettings = JSON.parse(JSON.stringify(settings));
                    newSettings.chart.echart = mappedJSON;
                    dispatch(setSettings(newSettings));
                    dispatch(reVerifyColumns());
                    persistProperty(mappedJSON);
                }}
            />
        )
    } else {
        const categorical = dataView?.categorical;
        if (!dataView && !categorical || settings && settings.chart.echart === '{}') {
            return (
                <Tutorial
                    height={option.viewport.height}
                    width={option.viewport.width}
                    dataset={dataset}
                />
            )
        }

        if (settings) {
            return (
                <>
                    <Viewer
                        dataset={dataset}
                        height={option.viewport.height}
                        width={option.viewport.width}
                        echartJSON={content}
                    />
                </>
            );
        }
    }
}
