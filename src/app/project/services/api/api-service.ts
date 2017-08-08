// Copyright (c) 2017 Huzaib Shafi - (http://www.shafihuzaib.com)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT



import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable, ReplaySubject } from 'rxjs';
import 'rxjs/Rx';

import { Config } from '../config/config-service';
import { AuthService } from "../auth/auth-service";

@Injectable()
export class Api {
    baseUrl: string;
    apiAcceptHeader: any;
    defaultHeaders: any = {};

    /**
     * This class will be used as a wrapper for Angular Http.
     *
     * @param http
     * @param config
     */
    constructor(private http: Http, private config: Config) {
        let accept = '*/' + "*";

        // accept += this.config.getEnv('API_STANDARDS_TREE') + '.';
        // accept += this.config.getEnv('API_SUBTYPE') + '.';
        // accept += this.config.getEnv('API_VERSION') + '+json';

        this.apiAcceptHeader = {'Accept': accept};

        //Retrieve tokens from storage (if any) & load them to defaultHeaders

        this.loadTokens();

        this.baseUrl = this.config.get('api.baseUrl');
    }

    /**
     * Set base uri for api requests.
     *
     * @param uri
     */
    setBaseUri(uri: string) {
        this.baseUrl = uri;
    }

    /**
     * Add new default header.
     *
     * @param key
     * @param value
     */
    addDefaultHeader(key: string, value: string) {
        let header = {};
        header[ key ] = value;

        Object.assign(this.defaultHeaders, header);
    }

    /**
     * Remove custom default header.
     *
     * @param key
     */
    deleteDefaultHeader(key: string) {
        delete this.defaultHeaders[ key ];
    }

    /**
     * Wrapper for angular http.request for our api.
     *
     * @param url
     * @param options
     * @returns {Observable<R>}
     */
    request(url: any, options: any = {}) {
        if (url.constructor === String) {
            options = this.prepareApiRequest(options);
        } else {
            url.url = this.baseUrl + '/' + url;
        }

        return this.http
            .request(this.getBuiltUrl(url), options)
            .map(this.extractData)
            .catch(this.catchError);
    }

    /**
     * Wrapper for angular http.get for our api.
     *
     * @param url
     * @param options
     * @returns {Observable<R>}
     */
    get(url: string, options: any = {}) {
        if (options && (options.data || options.search)) {
            options.search = this.serialize(options.data || options.search);
        }

        options = this.prepareApiRequest(options);

        return this.http
            .get(this.getBuiltUrl(url), options)
            .map(this.extractData)
            .catch(this.catchError);
    }

    /**
     * Wrapper for angular http.post for our api.
     *
     * @param url
     * @param data
     * @param options
     * @param contentType
     * @returns {Observable<R>}
     */
    post(url: string, data: any = {}, options: any = {}, contentType: string = 'application/json') {
        options = this.prepareApiRequest(options);
        options.headers.append('Content-Type', contentType);

        if (data.constructor === Object && contentType == 'application/x-www-form-urlencoded') {
            data = this.serialize(data, '', false);
            console.log(data);
        }
        else{
            data = JSON.stringify(data);
        }

        return this.http
            .post(this.getBuiltUrl(url), data, options)
            .map(this.extractData)
            .catch(this.catchError);
    }

    /**
     * Wrapper for angular http.put for our api.
     *
     * @param url
     * @param data
     * @param options
     * @returns {Observable<R>}
     */
    put(url: string, data: any = {}, options: any = {}) {
        options = this.prepareApiRequest(options);
        options.headers.append('Content-Type', 'application/json');

        if (data.constructor === Object) {
            data = JSON.stringify(data);
        }

        return this.http
            .put(this.getBuiltUrl(url), data, options)
            .map(this.extractData)
            .catch(this.catchError);
    }

    /**
     * Wrapper for angular http.delete for our api.
     *
     * @param url
     * @param options
     * @returns {Observable<R>}
     */
    delete(url: string, options: any = {}) {
        options = this.prepareApiRequest(options);
        options.headers.append('Content-Type', 'application/json');

        return this.http
            .delete(this.getBuiltUrl(url), options)
            .map(this.extractData)
            .catch(this.catchError);
    }

    /**
     * Wrapper for angular http.delete for our api.
     *
     * @param url
     * @param data
     * @param options
     * @returns {Observable<R>}
     */
    patch(url: string, data: any = {}, options: any = {}) {
        options = this.prepareApiRequest(options);
        options.headers.append('Content-Type', 'application/json');

        if (data.constructor === Object) {
            data = JSON.stringify(data);
        }

        return this.http
            .patch(this.getBuiltUrl(url), data, options)
            .map(this.extractData)
            .catch(this.catchError);
    }

    /**
     * Wrapper for angular http.delete for our api.
     *
     * @param url
     * @param options
     * @returns {Observable<R>}
     */
    head(url: string, options: any = {}) {
        options = this.prepareApiRequest(options);
        options.headers.append('Content-Type', 'application/json');

        return this.http
            .head(this.getBuiltUrl(url), options)
            .map(this.extractData)
            .catch(this.catchError);
    }

    /**
     * Extract data.
     *
     * @param response
     * @returns {any|{}}
     */
    private extractData(response: any): any {
        let body = response.json();

        // CDP doesn't have a consistent API return format, hence 
        // it is preferable to just return the body object
        return body;
    }

    /**
     * Catch error.
     *
     * @param error
     * @returns {ErrorObservable}
     */
    private catchError(error: any): any {
        let errMsg = (error.message)
            ? error.message
            : `Error - ${error.status}`;

        console.error('Error - ' + error.status + (error.message && (' - ' + error.message) || ''));

        return Observable.throw(errMsg);
    }

    /**
     * Prefix with api base.
     *
     * @param url
     * @returns {string}
     */
    private getBuiltUrl(url): string {
        if (url.startsWith('/') && this.baseUrl.endsWith('/')) {
            url = url.substr(1);
        }

        return this.baseUrl + url;
    }

    /**
     * Prepare request object for use.
     * options[eheaders] = {} : Extra Headers to be appended
     * 
     * @param options
     * @returns {RequestOptions}
     */
    private prepareApiRequest(options: any): RequestOptions {
        let headers = Object.assign(
            this.apiAcceptHeader,
            this.defaultHeaders,
            (options && options.headers) || {},
            (options && options.eheaders)? options.eheaders : {}
        );

        if (!options || options.constructor !== RequestOptions) {
            options = new RequestOptions(options);
        }

        options.headers = options.headers || new Headers(headers);

        return options;
    }

    /**
     * Resursively serialize an object/array.
     *
     * @param obj
     * @param prefix
     * @returns {URLSearchParams}
     */
    private serialize(obj: Object, prefix: string = '', uriEncode = true): URLSearchParams {
        let str = [];

        for (let p in obj) {
            if (obj.hasOwnProperty(p)) {
                let _prefix = prefix ? prefix + '[' + p + ']' : p, value = obj[ p ];

                str.push(typeof value === 'object'
                    ? this.serialize(value, _prefix)
                    : (uriEncode)? encodeURIComponent(_prefix) + '=' + encodeURIComponent(value) : _prefix + '=' + value
                );
            }
        }

        return new URLSearchParams(str.join('&'));
    }

    /**
     * Load tokens into defaultHeaders array from localStorage
     */
    loadTokens(){
        let authToken = localStorage.getItem('AUTH_TOKEN');
        let tqlToken =  localStorage.getItem('TQL_TOKEN');

        if(authToken){
            this.defaultHeaders['Authorization'] = "Bearer " + authToken;
        }
            
        if(tqlToken){
            this.defaultHeaders['token'] = tqlToken;
        }
        
    }

    /**
     * Store Authorization token & it's expiry (in ms) to localStorage
     * @param token 
     */
    storeAuthToken(token, expiry, refresh_token){
        /**
         * Storing expiry as a date (in ms) makes it possible to compare
         * the dates right-away, without any further conversion
         */
        localStorage.setItem('AUTH_TOKEN', token);
        let date = new Date();
        date.setSeconds(expiry);
        localStorage.setItem('AUTH_TOKEN_EXPIRY', date.valueOf().toString());
        localStorage.setItem("AUTH_REFRESH_TOKEN", refresh_token);
        //Load the updated tokens
        this.loadTokens();
    }

    /**
     * Store TQL Access Token to localStorage
     * @param token 
     */
    storeTqlToken(token, expiry){
        localStorage.setItem('TQL_TOKEN', token);
        let date = new Date();
        date.setSeconds(expiry);
        localStorage.setItem('TQL_TOKEN_EXPIRY', date.valueOf().toString());
        //Load the updated tokens
        this.loadTokens();
    }

    /**
     * Store / Get Refresh Token to / from localStorage
     * @param token 
     */
    public set authRefreshToken(token){
        localStorage.setItem("AUTH_REFRESH_TOKEN", token);
    }

    public get authRefreshToken(){
        return localStorage.getItem("AUTH_REFRESH_TOKEN");
    } 

   

    
}