/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { geo_Extent } from './geo_Extent';
import type { geo_Geometry } from './geo_Geometry';
import type { ModelRef } from './ModelRef';

/**
 * Defines the output for feature query.
 * Filterable fields are:
 *
 * - id
 * - properties.* (e.g. `properties.title` if the feature contains the field title)
 * - geometry
 * - length
 * - area
 *
 * Includable fields:
 *
 * Everything except formats.
 * To include a certain feature field e.g. title, you can specify
 * `properties.title`.
 * Specifying `properties` in `include`, will include every field in the
 * feature.
 *
 */
export type feature_QueryOutput = {
    /**
     * Can be filtered. Can be included.
     */
    id: string;
    /**
     * Cannot be filtered. Cannot be excluded or included.
     */
    formats?: Array<string>;
    /**
     * Can be filtered. Can be included.
     * To include a specific field e.g. title, specify `properties.title`.
     * To include all properties, specify `properties`.
     *
     */
    properties: Record<string, any>;
    geometry?: geo_Geometry;
    /**
     * Can be filtered. Can be included.
     */
    length?: number;
    /**
     * Can be filtered. Can be included.
     */
    active?: number;
    /**
     * Can be filtered. Can be included.
     */
    inactive?: number;
    /**
     * Can be filtered. Can be included.
     */
    deleted?: boolean;
    /**
     * Can be filtered. Can be included.
     */
    area?: number;
    extent?: geo_Extent;
    /**
     * Cannot be filtered. Can be included.
     */
    distance?: number;
    sourceRef?: ModelRef;
};

