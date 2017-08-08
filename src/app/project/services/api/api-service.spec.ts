// Copyright (c) 2017 Huzaib Shafi - (http://www.shafihuzaib.com)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { TestBed, fakeAsync, inject, tick } from "@angular/core/testing";
import { HttpModule, XHRBackend, RequestMethod, BaseRequestOptions, Http, Response, ResponseOptions } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";

import { Api } from "./api-service";
import { Config } from "../config/config-service";

/**
 * Fake class to mock Config class required by Api
 */
class FakeConfig {
    public get(x:any=""){
        return "http://www.abc.example.com/api";
    }

    getEnv(x = ""){
        return "";
    }
}

/**
 * TODO: Include tests for ErrorResponses
 */

describe("API Service: Unit", ()=>{
    beforeEach(()=>{
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                    
                },
                {
                    provide: Config,
                    useClass: FakeConfig
                },
                Api
            ]
        });
    });

    it("is setBaseUri working?", fakeAsync(inject([Api], (api:Api)=>{

        let uri = "http://www.somebackendservice.example.com/api/"
        api.setBaseUri(uri);

        expect(api.baseUrl).toEqual(uri);
    })));

    it("should manipulate defaultHeaders", fakeAsync(inject([Api], (api:Api)=>{

        let key = "Authorization";
        let value = "Bearer asdfdskmf23erfdjxm";

        api.addDefaultHeader(key, value);

        expect(api.defaultHeaders[key]).toBeDefined();
        expect(api.defaultHeaders[key]).toEqual(value);

        tick(5000);
        expect(api.defaultHeaders[key]).toBeDefined();
        expect(api.defaultHeaders[key]).toEqual(value);
 
        api.deleteDefaultHeader(key);

        expect(api.defaultHeaders[key]).toBeUndefined();
    })));

    it("should GET the results", fakeAsync(inject([XHRBackend, Api, Config], (mockBackend, api:Api, config)=>{

        let baseUrl = config.get('api.baseUrl');
        let url = "get_some_string";
        let data = {data: {some_var: "some_value"}};

        mockBackend.connections.subscribe((mockConnection:MockConnection)=>{
            expect(mockConnection.request.method).toBe(RequestMethod.Get);
            expect(mockConnection.request.url).toEqual(prepareUrl(baseUrl,url) + "?some_var=some_value");
            mockConnection.mockRespond( new Response(new ResponseOptions({body: mockResponse})));

        });
        api.get(url, data).subscribe(res => {
            console.error(res);
            expect(res).toEqual(mockResponse);
        }, err => { console.log(err)});
    })));

    it("should GET the results when options are not passed", fakeAsync(inject([XHRBackend, Api, Config], (mockBackend, api:Api, config)=>{

        let baseUrl = config.get('api.baseUrl');
        let url = "get_some_string";

        mockBackend.connections.subscribe((mockConnection:MockConnection)=>{
            expect(mockConnection.request.method).toBe(RequestMethod.Get);
            expect(mockConnection.request.url).toEqual(prepareUrl(baseUrl,url));
            mockConnection.mockRespond( new Response(new ResponseOptions({body: mockResponse})));
        });
        api.get(url).subscribe(res => {
            expect(res).toEqual(mockResponse);
        });
        
    })));


    it("should POST the request", fakeAsync(inject([XHRBackend, Api, Config], (mockBackend, api:Api, config)=>{

        let baseUrl = config.get('api.baseUrl');
        let url = "get_some_string";
        let data = {data: {some_var: "some_value"}};


        mockBackend.connections.subscribe((mockConnection:MockConnection)=>{
            expect(mockConnection.request.method).toBe(RequestMethod.Post);
            expect(mockConnection.request.url).toEqual(prepareUrl(baseUrl,url));
            expect(mockConnection.request.json()).toEqual(data);
            mockConnection.mockRespond( new Response(new ResponseOptions({body: mockResponse})));
        });
        api.post(url, data).subscribe(res => {
            expect(res).toEqual(mockResponse);
        });
        
    })));

    it("should PUT the request", fakeAsync(inject([XHRBackend, Api, Config], (mockBackend, api:Api, config)=>{

        let baseUrl = config.get('api.baseUrl');
        let url = "get_some_string";
        let data = {data: {some_var: "some_value"}};

        mockBackend.connections.subscribe((mockConnection:MockConnection)=>{
            expect(mockConnection.request.method).toBe(RequestMethod.Put);
            expect(mockConnection.request.url).toEqual(prepareUrl(baseUrl,url));
            expect(mockConnection.request.json()).toEqual(data);
            mockConnection.mockRespond( new Response(new ResponseOptions({body: mockResponse})));
        });
        api.put(url, data).subscribe(res => {
            expect(res).toEqual(mockResponse);
        });
        
    })));

    it("should DELETE the resource", fakeAsync(inject([XHRBackend, Api, Config], (mockBackend, api:Api, config)=>{

        let baseUrl = config.get('api.baseUrl');
        let url = "get_some_string";
        let data = {data: {some_var: "some_value"}};

        mockBackend.connections.subscribe((mockConnection:MockConnection)=>{
            expect(mockConnection.request.method).toBe(RequestMethod.Delete);
            expect(mockConnection.request.url).toEqual(prepareUrl(baseUrl,url));
            mockConnection.mockRespond( new Response(new ResponseOptions({body: mockResponse})));
        });
        api.delete(url, data).subscribe(res => {
            expect(res).toEqual(mockResponse);
        });
        
    })));

    it("should store & load tokens from/to localStorage", ()=>{
        let api = TestBed.get(Api);
        let authToken = "some_random_authorization7bearer0token";
        let tqlToken = "some_random_tql_access_token";

        api.storeAuthToken(authToken);
        api.storeTqlToken(tqlToken);

        expect(localStorage.getItem('AUTH_TOKEN')).toEqual(authToken);
        expect(localStorage.getItem('TQL_TOKEN')).toEqual(tqlToken);

        api.loadTokens();

        expect(api.defaultHeaders['Authorization']).toEqual("Bearer " + authToken);
        expect(api.defaultHeaders['token']).toEqual(tqlToken);
        
    });


});

/**
 * Prepare the url to be requested
 * @param baseUrl 
 * @param url 
 */
function prepareUrl(baseUrl, url){
    if (url.startsWith('/') && baseUrl.endsWith('/')) {
                url = url.substr(1);
        }
    return baseUrl + url;        
}

const mockResponse = {
    "result": "success",
    Resources: [
        {
            "id": 123,
            name: "Some Name One",
            location: "Some Location One"
        },
        {
            "id": 323,
            name: "Name Two",
            location: "Some Location Two"
        }
    ]
}