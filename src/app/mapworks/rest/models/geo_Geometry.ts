/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { geo_Crs } from './geo_Crs';
import type { geo_json_LineString } from './geo_json_LineString';
import type { geo_json_MultiLineString } from './geo_json_MultiLineString';
import type { geo_json_MultiPoint } from './geo_json_MultiPoint';
import type { geo_json_MultiPolygon } from './geo_json_MultiPolygon';
import type { geo_json_Point } from './geo_json_Point';
import type { geo_json_Polygon } from './geo_json_Polygon';
import type { query_FeatureRef } from './query_FeatureRef';

export type geo_Geometry = (geo_Crs & {
    geometry: (geo_json_Point | geo_json_LineString | geo_json_Polygon | geo_json_MultiPoint | geo_json_MultiLineString | geo_json_MultiPolygon | query_FeatureRef);
});

