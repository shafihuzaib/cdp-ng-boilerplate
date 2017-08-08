// Copyright (c) 2017 Huzaib Shafi - (http://www.shafihuzaib.com)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

import { Api, AuthService } from "../..";
import { CONFIG } from "../../../config";


/**
 * Service to implement Device Engine API for Real Time information
 */
@Injectable()
export class RealTimeParkingService{
    constructor(private api:Api, private authService:AuthService){}

    getAllParkingSpaces() : Observable<any> {
        let query = {
            Query: {
                Find: {
                    ParkingSpace: {
                        sid: {
                            ne: ""
                        }
                    }
                }
            }
        };

        return this.authService.tokenValidatedRequest(()=>{
            return this.api.post( CONFIG.api.engineUrl + 'devices/parking', query);
        }, true);
    }


}