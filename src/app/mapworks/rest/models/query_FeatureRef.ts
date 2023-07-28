/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ModelRef } from './ModelRef';

/**
 * Feature reference.
 */
export type query_FeatureRef = {
    type: query_FeatureRef.type;
    featureSetRef: ModelRef;
    featureRef: ModelRef;
};

export namespace query_FeatureRef {

    export enum type {
        REFERENCE = 'Reference',
    }


}

