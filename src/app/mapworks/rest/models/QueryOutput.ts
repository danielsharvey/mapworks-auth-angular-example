/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Query result object.
 */
export type QueryOutput = {
    /**
     * Flag whether the query was executed successfully.
     */
    success: boolean;
    /**
     * Total number of results.
     */
    total: number;
    /**
     * Query result objects.
     */
    data: Array<Record<string, any>>;
};

