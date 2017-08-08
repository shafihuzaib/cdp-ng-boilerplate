// Copyright (c) 2017 Huzaib Shafi - (http://www.shafihuzaib.com)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { TestBed, fakeAsync, inject } from "@angular/core/testing"
import { Observable } from "rxjs";
import { AuthService, Api, Config } from "../..";
import { RealTimeParkingService } from "./realtime-parking-service";

class FakeAuth{
    tokenValidatedRequest(func , tqlCheck = false){}
}

class FakeApi{
    post(url, data){};
    addDefaultHeader(r){};
    storeAuthToken(a,b,c){}
    loadTokens(){};
    get(url){};
}


describe("RealTimeParkingService: Unit", ()=>{
    let parkingService:RealTimeParkingService;
    let api: Api;
    let authService: AuthService;
    beforeEach(()=>{
        TestBed.configureTestingModule({
            providers: [
                
                {
                    provide: AuthService,
                    useClass: FakeAuth
                },
                {
                    provide: Api,
                    useClass: FakeApi
                },
                 Config

            ]
        });

        api = TestBed.get(Api);
        authService = TestBed.get(AuthService);
        parkingService = new RealTimeParkingService(api, authService);
        
    })

    it('getAllParkingSpaces: Unit', ()=>{

        let query = {};
        expect(true).toBeTruthy();

        spyOn(api, 'post').and.callFake((url, data)=>{
            expect(data).toBeDefined();
            expect(data.Query).toBeDefined();
            return new Observable(obs => { obs.next(mockParkingResponse)});
        });

        spyOn(authService, 'tokenValidatedRequest').and.callFake((func)=>{
            return func();
        });

        parkingService.getAllParkingSpaces().subscribe( (r)=> {
            expect(r).toEqual(mockParkingResponse);
        } );

    });


});


let mockParkingResponse = {
    Find: {
        Status: "success",
        Result: [
            {
                ParkingSpace: {
                    sid: 1
                }
            },
            {
                ParkingSpace: {
                    sid:2
                }
            }
        ]
    }
}


