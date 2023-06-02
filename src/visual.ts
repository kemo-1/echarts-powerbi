"use strict";

import React from 'react';
import reactDom from 'react-dom';
import { Application } from './Application';

import "../style/visual.scss";
// import "core-js/stable";
import powerbiVisualsApi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbiVisualsApi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbiVisualsApi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbiVisualsApi.VisualObjectInstance;
import DataView = powerbiVisualsApi.DataView;
import VisualObjectInstanceEnumerationObject = powerbiVisualsApi.VisualObjectInstanceEnumerationObject;
// import VisualDataChangeOperationKind = powerbiVisualsApi.VisualDataChangeOperationKind;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost

import { VisualSettings } from "./settings";

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private host: IVisualHost;
    private currentOptions: VisualUpdateOptions;

    private fetchIsDone: boolean = false; 

    private appliccationRef: React.RefObject<{
        setOptions: (options: VisualUpdateOptions, settings: VisualSettings) => void;
    }>;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;

        window.open = (url?: string | URL) => {
            if (typeof url === "string") {
                this.host.launchUrl(url);
            }
            return window;
        };

        if (document) {
            this.appliccationRef = React.createRef<{
                setOptions: ((options: VisualUpdateOptions) => void) | null
            } >();
            reactDom.render(React.createElement(Application, {
                ref: this.appliccationRef,
                host: options.host
            }), this.target);
        }
    }

    public update(options: VisualUpdateOptions) {
        this.currentOptions = options;
        const dataView = options && options.dataViews && options.dataViews[0];
        this.settings = Visual.parseSettings(dataView);
        this.appliccationRef.current?.setOptions(options, this.settings);
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        if (options.objectName === 'chart') {
            return <VisualObjectInstance[]>[
                {
                    objectName: options.objectName,
                    properties: {}
                }
            ];
        }
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}