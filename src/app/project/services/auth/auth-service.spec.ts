// Copyright (c) 2017 Huzaib Shafi - (http://www.shafihuzaib.com)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { TestBed, fakeAsync, inject } from "@angular/core/testing"
import { Observable } from "rxjs";
import { AuthService } from "./auth-service";
import { Api } from "../api/api-service";
import { Config } from "../config/config-service";
import { HttpModule, XHRBackend, RequestMethod, BaseRequestOptions, Http, Response, ResponseOptions } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";

class FakeApi{
    post(url, data){};
    addDefaultHeader(r){};
    storeAuthToken(a,b,c){}
    loadTokens(){};
    get(url){};
}


/**
 * Fake class to mock Config class required by Api
 */
class FakeConfig {
    get(x:any=""){}

    getEnv(x = ""){}
}

describe("AuthService: Unit", ()=>{
    let authService:AuthService;
    let api: Api;
    let config: Config;

    beforeEach(()=>{
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Api,
                    useClass: FakeApi
                },
                {
                    provide: Config,
                    useClass: FakeConfig
                }

            ]
        });
        api = TestBed.get(Api);
        config = new Config();
        authService = new AuthService(api, config);
    })

    it('should login', ()=>{
        let user = "user";
        let pass = "pass";
        let client = "client_secret";

        spyOn(config, "get").and.callFake((key)=>{
            return client;
        });

        spyOn(api, 'get').and.callFake((url)=>{
            expect(url).toEqual('/accounts/validate');
            return new Observable(o=>{o.next(userDetailsMock)})
        });

        spyOn(api, 'post').and.callFake((url, data)=>{
            let requestData = {
                "username": user,
                "password": pass,
                "client_id": config.get("api.client_id"),
                "client_secret": config.get("api.client_secret"),
                "grant_type": "password"
            };
            expect(data).toBeDefined();
            expect(data).toEqual(requestData);
            return new Observable(o=>{o.next(login_response)})
        });

        authService.login(user, pass).subscribe(r=>{
            expect(r).toBeDefined();
            expect(r).toEqual(login_response);
            
        });

    });

    //needs re-visit
    it('tokenValidatedRequest - Method: Unit', ()=>{

        //set token expiry
        localStorage.setItem("AUTH_TOKEN_EXPIRY", ((new Date()).setSeconds(-3600)).valueOf().toString() );
        localStorage.setItem("TQL_TOKEN_EXPIRY", ((new Date()).setSeconds(-1200)).valueOf().toString() );

        spyOn(authService, 'refresh').and.callFake(()=>{
            return new Observable(r => { r.next({'refresh': 'was called'}); });
        });

        spyOn(authService, 'activateUser').and.callFake(()=>{
            return new Observable(r => { r.next({'activateUser': 'was called'}); });
        });

        spyOn(api, 'post').and.callFake((url, data)=>{
            return new Observable(r => { r.next({'api-post': 'was called'}); });
        });

        
        authService.tokenValidatedRequest(()=>{
            return api.post('testing-it', {'with':"some data"}).subscribe();
        }, true);

        expect(authService.activateUser).toHaveBeenCalled();
        expect(authService.refresh).toHaveBeenCalledTimes(1);
        

    });
 
    //needs re-visit
    it('tokenValidatedRequest - Method: Unit - ZERO calls', ()=>{

        //set token expiry
        localStorage.setItem("AUTH_TOKEN_EXPIRY", ((new Date()).setSeconds(3600)).valueOf().toString() );
        localStorage.setItem("TQL_TOKEN_EXPIRY", ((new Date()).setSeconds(1200)).valueOf().toString() );

        spyOn(authService, 'refresh').and.callFake(()=>{
            return new Observable(r => { r.next({'refresh': 'was called'}); });
        });

        spyOn(authService, 'activateUser').and.callFake(()=>{
            return new Observable(r => { r.next({'activateUser': 'was called'}); });
        });

        spyOn(api, 'post').and.callFake((url, data)=>{
            console.log(url,data);
            return new Observable(r => { r.next(login_response); });
        });

        
        authService.tokenValidatedRequest(()=>{
            return api.post('/test', {'with':"some data"}).subscribe(r=>{
                console.log(2);
                expect(r).toEqual(login_response);
            });
        }, true);

        expect(authService.activateUser).toHaveBeenCalledTimes(0);
        expect(authService.refresh).toHaveBeenCalledTimes(0);
        expect(api.post).toHaveBeenCalledTimes(1);

        
    });




});




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
            "grant_type": "password",
            "expires_in": 3229
        }

const activateUserResponse = {
    http : {
        endpoint : "https://173.39.80.101/dev3.2.1/t/ciscointernal.com/cdp/v1/devices",
        token: "TQLhttp-lkbljncb-1501582494705",
        status: "Activated",
        sessionExpiry: 1200
    },
    ws: {}
}        

const userDetailsMock = {
    "id": "c71e52cc-7494-4fe0-8b43-a9d6ac32c7ff",
    "userName": "partha",
    "name": "Partha K",
    "tenant": "paris.com",
    "emailAddress": "partha@paris.com",
    "phoneNumber": "+919999999999",
    "correspondenceAddress": {
        "city": "Bangalore",
        "street": "MG Road",
        "state": "Karnataka",
        "postalCode": "560000",
        "country": "India"
    },
    "createdOn": "2017-06-01T13:23:44.000Z",
    "updatedOn": "2017-06-07T12:38:40.000Z",
    "state": "ACTIVE",
    "groupNames": [
        "CDP_ADMIN",
        "OPERATOR"
    ]
}