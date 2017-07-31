// Copyright (c) 2017 Huzaib Shafi - (http://www.shafihuzaib.com)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT



import { Injectable } from '@angular/core';

import { CONFIG, APP_ENVIRONMENT } from '../../config';

@Injectable()
export class Config {
    private config: Object = CONFIG;
    private env: Object = APP_ENVIRONMENT;

    constructor() {
    }

    /**
     * Get environment variable.
     *
     * @param key
     * @returns {any}
     */
    getEnv(key: any) {
        return this.env[ key ];
    }

    /**
     * Recursively get config property.
     *
     * @param path
     * @returns {*}
     */
    get(path): any {
        let placeholder = this.config;
        let keys = path.split('.');

        // Iterate through the split path elements
        for (let i = 0; i < keys.length; i++) {
            // Check if placeholder has key
            if (placeholder.hasOwnProperty(keys[i])) {
                // It has the key, go deeper 1 level
                placeholder = placeholder[keys[i]];
            } else {
                // It doesn't have the key, return null
                return undefined;
            }
        }

        return placeholder;
    }
}