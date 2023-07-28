/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { geo_Bounds } from './geo_Bounds';
import type { geo_Crs } from './geo_Crs';

export type geo_Extent = (geo_Crs & {
    /**
     * The zoom scale.
     */
    scale?: number;
    bounds: geo_Bounds;
});

