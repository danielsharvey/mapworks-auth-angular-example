/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { geo_json_coordinates_LineString } from './geo_json_coordinates_LineString';
import type { geo_json_Geometry } from './geo_json_Geometry';

export type geo_json_LineString = (geo_json_Geometry & {
    /**
     * Type of geometry.
     */
    type?: geo_json_LineString.type;
    coordinates?: geo_json_coordinates_LineString;
});

export namespace geo_json_LineString {

    /**
     * Type of geometry.
     */
    export enum type {
        LINE_STRING = 'LineString',
    }


}

