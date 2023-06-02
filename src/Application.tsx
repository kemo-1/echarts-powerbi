import React from 'react';

import powerbiApi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbiApi.extensibility.visual.VisualUpdateOptions;


import { VisualSettings } from './settings';
import { Viewer } from './View';
import { Editor } from './Editor';
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
    const unmappedColumns = chartColumns && dataView?.metadata.columns ? verifyColumns(chartColumns, dataView?.metadata.columns) : [];

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

    // const convert = React.useCallback((v: powerbiApi.PrimitiveValue, type: powerbiApi.ValueTypeDescriptor): powerbiApi.PrimitiveValue => {
    //     if (v === null || v === undefined || v === false) {
    //         return v as powerbiApi.PrimitiveValue;
    //     } else {
    //         const safeValue = sanitize(v as any, defaultDompurifyConfig);
    //         if (type.numeric || type.integer) {
    //             return +safeValue;
    //         }
    //         if (type.temporal || type.dateTime) {
    //             if (v instanceof Date) {
    //                 return v as powerbiApi.PrimitiveValue;
    //             }
    //             if (typeof v === 'number') {
    //                 return +safeValue as powerbiApi.PrimitiveValue;
    //             }
    //         }
    //         return safeValue as powerbiApi.PrimitiveValue;
    //     } 
    // }, [sanitize, defaultDompurifyConfig]);

    if (!option) {
        return (<p>Loading...</p>)
    }

    if (option && settings && option.editMode === powerbiApi.EditMode.Advanced) {
        host.tooltipService.hide({immediately: true, isTouchEvent: false});
        host.licenseManager.clearLicenseNotification();
        return (
            <Editor
                echartJson={settings.chart.schema}
                dataset={dataset}
                height={option.viewport.height}
                width={option.viewport.width}
                onSave={persistProperty}
            />
        );
    } else {
        if (option && unmappedColumns.length) {
            return (
                <Mapping
                    height={option.viewport.height}
                    width={option.viewport.width}
                    dataView={dataView}
                    dataset={dataset}
                    unmappedColumns={unmappedColumns}
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
}

export const Application = React.forwardRef(ApplicationContainer);
