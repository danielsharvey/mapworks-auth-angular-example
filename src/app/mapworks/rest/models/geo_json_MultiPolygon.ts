/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { geo_json_coordinates_Polygon } from './geo_json_coordinates_Polygon';
import type { geo_json_Geometry } from './geo_json_Geometry';

export type geo_json_MultiPolygon = (geo_json_Geometry & {
    /**
     * Type of geometry.
     */
    type?: geo_json_MultiPolygon.type;
    /**
     * Coordinates.
     */
    coordinates?: Array<geo_json_coordinates_Polygon>;
});

export namespace geo_json_MultiPolygon {

    /**
     * Type of geometry.
     */
    export enum type {
        MULTI_POLYGON = 'MultiPolygon',
    }


}

