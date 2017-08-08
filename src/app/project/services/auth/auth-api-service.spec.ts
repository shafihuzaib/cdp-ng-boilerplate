// Copyright (c) 2017 Huzaib Shafi - (http://www.shafihuzaib.com)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { TestBed, fakeAsync, inject, tick } from "@angular/core/testing";
import { HttpModule, XHRBackend, RequestMethod, BaseRequestOptions, Http, Response, ResponseOptions } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { forwardRef } from "@angular/core";
import { Observable } from "rxjs";

import { Api } from "../api/api-service";
import { Config } from "../config/config-service";
import { AuthService } from "./auth-service";

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

describe("AuthService - API Service:  Integration", ()=>{
    let api:Api;
    let authService:AuthService;
    beforeEach(()=>{
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                Api, Config,
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                    
                },
                {
                    provide: Config,
                    useClass: FakeConfig
                }, 
                //AuthService
            ]
        });
    });

    beforeEach(inject([Api], (apiW:Api)=>{
        api = apiW;
        authService = new AuthService(api, new Config());
    }));
    

    it("should Login & save Access Token", fakeAsync(inject([XHRBackend, Config], (mockBackend, config)=>{

        mockBackend.connections.subscribe((mockConnection:MockConnection)=>{

            if(mockConnection.request.url == '/token'){
                expect(mockConnection.request.method).toBe(RequestMethod.Post);
            console.info(mockConnection.request.getBody());
            expect(mockConnection.request.headers.get('Content-Type')).toEqual('x-www-form-urlencoded');
            mockConnection.mockRespond( new Response(new ResponseOptions({body: login_response})));
            }

            
        });
        
       

        authService.login("user1", "password").subscribe(r=>{
            expect(r).toBeDefined();
            expect(r).toEqual(login_response);
            expect(api.defaultHeaders['Authorization']).toBeDefined();
            expect(api.defaultHeaders['Authorization']).toEqual("Bearer " + r.access_token);
            
        });
        

        
        
    })));

    //needs re-visit
    it("should ActivateUser", fakeAsync(inject([XHRBackend, Config], (mockBackend, config)=>{
        let userKey = "some user key";
        localStorage.setItem("USER_ID", userKey);
        mockBackend.connections.subscribe((mockConnection:MockConnection)=>{
            expect(mockConnection.request.headers.get('userKey')).toBeDefined();
            expect(mockConnection.request.headers.get('userKey')).toEqual(userKey);
            expect(mockConnection.request.method).toBe(RequestMethod.Post);
            mockConnection.mockRespond( new Response(new ResponseOptions({body: login_response})));
        });
        
        authService.activateUser();
    })));

    it('should request after token validation',fakeAsync(inject([XHRBackend, Config], (mockBackend, config)=>{

        //set token expiry
        localStorage.setItem("AUTH_TOKEN_EXPIRY", ((new Date()).setSeconds(-3600)).valueOf().toString() );
        localStorage.setItem("TQL_TOKEN_EXPIRY", ((new Date()).setSeconds(-1200)).valueOf().toString() );

        mockBackend.connections.subscribe((mockConnection:MockConnection)=>{
            //expect(mockConnection.request.method).toBe(RequestMethod.Post);
            console.info(mockConnection.request.getBody());
            mockConnection.mockRespond( new Response(new ResponseOptions({body: login_response})));
        });
        spyOn(api, "post").and.callFake( (url, data) => {
            return new Observable(r => { r.next({'api-post': 'was called'}); });
        });
        
        authService.tokenValidatedRequest(()=>{ 
            return api.post('/some request', mockResponse).subscribe(r=>{
            });
        }, true);
    })));


//);

    
   

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

const login_response = {
            'access_token': "some_Access_token_1234_4321_f",
            "refresh_token": "djckiokjdfncbvnfjc34r432fnc",
            "grant_type": "password"
        }