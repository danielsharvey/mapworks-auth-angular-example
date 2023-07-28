/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { geo_json_coordinates_Polygon } from './geo_json_coordinates_Polygon';
import type { geo_json_Geometry } from './geo_json_Geometry';

export type geo_json_Polygon = (geo_json_Geometry & {
    /**
     * Type of geometry.
     */
    type?: geo_json_Polygon.type;
    coordinates?: geo_json_coordinates_Polygon;
});

export namespace geo_json_Polygon {

    /**
     * Type of geometry.
     */
    export enum type {
        POLYGON = 'Polygon',
    }


}

