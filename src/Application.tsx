import React from 'react';

import powerbiApi from "powerbi-visuals-api";

import { Viewer } from './View';
import { Tutorial } from './Tutorial';
import { Mapping } from './Mapping';
import { QuickChart } from './QuickChart';

import { useAppSelector, useAppDispatch } from './redux/hooks';
import { setSettings } from './redux/slice';
import { IVisualSettings } from './settings';
import { applyMapping } from './utils';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ApplicationProps {
}

/* eslint-disable max-lines-per-function */
export const Application: React.FC<ApplicationProps> = () => {

    const settings = useAppSelector((state) => state.options.settings);
    const option = useAppSelector((state) => state.options.options);
    const host = useAppSelector((state) => state.options.host);

    const dataView = useAppSelector((state) => state.options.dataView);
    const dataset = useAppSelector((state) => state.options.dataset);
    const unmappedColumns = useAppSelector((state) => state.options.unmappedColumns);

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
    }, [host]);

    if (!option || !settings || !dataView) {
        return (<h1>Loading...</h1>)
    }

    if (option.editMode === powerbiApi.EditMode.Advanced ||
        (settings.chart.echart === '{}' && dataView && dataset)) {
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
                    persistProperty(mappedJSON);
                    const newSettings: IVisualSettings = JSON.parse(JSON.stringify(settings));
                    newSettings.chart.echart = mappedJSON;
                    dispatch(setSettings(newSettings));
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
                        echartJSON={settings.chart.echart}
                    />
                </>
            );
        }
    }
}
