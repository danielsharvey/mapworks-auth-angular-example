/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { geo_json_coordinates_Point } from './geo_json_coordinates_Point';
import type { geo_json_Geometry } from './geo_json_Geometry';

export type geo_json_Point = (geo_json_Geometry & {
    /**
     * Type of geometry.
     */
    type?: geo_json_Point.type;
    coordinates?: geo_json_coordinates_Point;
});

export namespace geo_json_Point {

    /**
     * Type of geometry.
     */
    export enum type {
        POINT = 'Point',
    }


}

