import React from 'react';

import powerbiApi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbiApi.extensibility.visual.VisualUpdateOptions;


import { VisualSettings } from './settings';
import { Viewer } from './View';
import { Tutorial } from './Tutorial';
import { Mapping } from './Mapping';

// import { strings } from './strings';
// import { sanitize } from "dompurify";

import { createDataset, verifyColumns, getChartColumns } from "./utils";

export interface ApplicationProps {
    host: powerbiApi.extensibility.visual.IVisualHost
}

export interface ApplicationPropsRef {
    setOptions: (option: VisualUpdateOptions, settings: VisualSettings) => void;
}

/* eslint-disable max-lines-per-function */
const ApplicationContainer: React.ForwardRefRenderFunction<ApplicationPropsRef, ApplicationProps> = ({host}: ApplicationProps, ref: React.ForwardedRef<ApplicationPropsRef>) => {

    const [option, setOptions] = React.useState<VisualUpdateOptions>(null);
    const [settings, setSettings] = React.useState<VisualSettings>(null);

    React.useImperativeHandle(ref, () => ({
        setOptions: (option: VisualUpdateOptions, settings: VisualSettings) => {
            setOptions(option);
            setSettings(settings);
        }
    }));

    const dataView = option?.dataViews[0];

    const dataset = createDataset(dataView);
    const chartColumns = getChartColumns(settings?.chart.schema);
    const unmappedColumns = chartColumns && dataView?.metadata.columns ? verifyColumns(settings?.chart?.schema ,chartColumns, dataView?.metadata.columns) : [];

    const persistProperty = React.useCallback((json_string: string) => {
        const instance: powerbiApi.VisualObjectInstance = {
            objectName: "chart",
            selector: undefined,
            properties: {
                schema: json_string
            }
        };

        host.persistProperties({
            merge: [
                instance
            ]
        });
    }, [host]);

    if (!option) {
        return (<p>Loading...</p>)
    }

    if (option && unmappedColumns.length) {
        return (
            <Mapping
                height={option.viewport.height}
                width={option.viewport.width}
                dataView={dataView}
                dataset={dataset}
                unmappedColumns={unmappedColumns}
                onSaveMapping={persistProperty}
            />
        )
    } else {
        const categorical = dataView?.categorical;
        if (!dataView && !categorical || settings && settings.chart.schema === '{}') {
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
                        echartJSON={settings.chart.schema}
                    />
                </>
            );
        }
    }
}

export const Application = React.forwardRef(ApplicationContainer);
