// Copyright (c) 2017 Huzaib Shafi - (http://www.shafihuzaib.com)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

import { Api } from "../api/api-service";
import { Config } from "../config/config-service";
import { CONFIG } from "../../config";

@Injectable()
export class AuthService{


    constructor(private api: Api, private config: Config){

    }

    /**
     * Login a user to the API, invoking /token
     * @param username 
     * @param password 
     */
    login(username, password){
        let data = {
            'username': username,
            'password': password,
            'client_id': this.config.get("api.client_id"), //get from config
            'client_secret': this.config.get("api.client_secret"), //get from config
            'grant_type': "password"
        };

        /**
         * It may be a good idea to land a request for /userdetails, to fetch
         * the userKey (to be stored locally), so as to make activateUser()
         * call possible, without having to worry about doing it from
         * component.
         * 
         * However, this may not be required in later releases, when userKey 
         * is removed for activateUser()
         */
        return this.api.post('/token', data, {}, "application/x-www-form-urlencoded").do((res)=>{
            this.postAuthSuccess(res);
            this.api.get(CONFIG.api.engineUrl + 'accounts/validate').subscribe(r=>{
                localStorage.setItem("USER_ID", r.id);
            });
        });
        
    }

    /**
     * Refresh the Auth Token
     */
    refresh(){
        let data = {
            'grant_type': "refresh_token",
            'client_id': this.config.get("client_id"), //get from config
            'client_secret': this.config.get("client_secret"), //get from config
            'refresh_token': this.api.authRefreshToken
        };

        return this.api.post('/token', data, {}, 'application/x-www-form-urlencoded');
    }

    /**
     * Post a 
     */
    activateUser(){
        let query = {Query: {
            Activate: {
                RestAPI: true,
                WSAPI: true
            }
        }};

        let options = {
             eheaders : {
                userkey : localStorage.getItem('USER_ID')
            }
        };

        return this.api.post(CONFIG.api.engineUrl + 'devices/activateuser', query, options);
    }

    

    /**
     * Execute the given function after verifying the token(s) for expiry
     * The first parameter may return an Observable if required
     * @param func 
     * @param tqlCheck 
     */
    tokenValidatedRequest(func , tqlCheck = false): Observable<any>{
        /**
         * Delegate the actual task. However return an Observable, so as to execute 
         * the callback function only when subscribed to..
         */
        //return Observable.create(obs => obs = (this.__tokenValidatedRequest(func, tqlCheck)));

        return this.__tokenValidatedRequest(func, tqlCheck);
    }
    private __tokenValidatedRequest(func, tqlCheck = false): Observable<any>{
        let returnObservable = new Observable();
        
        /**
         * 1. check for auth token expiry - refresh it, if necessary
         * 2. after step 1 - check for TQL token expiry (if tqlCheck is true) - refresh it, if necessary
         * 3. 
         */
        if( parseInt(localStorage.getItem('AUTH_TOKEN_EXPIRY')) < (new Date()).valueOf() ){
            //auth expired
            this.refresh().subscribe(res => {
                //refreshed
                this.postAuthSuccess(res);

                if(tqlCheck &&  localStorage.getItem("TQL_TOKEN_EXPIRY") &&
                        parseInt(localStorage.getItem("TQL_TOKEN_EXPIRY")) < (new Date()).valueOf()
                   ){
                    
                    this.activateUser().subscribe(res => {
                        //TQL token subscribed 
                        returnObservable = func();
                    })
                }
                else{
                    // Probably not a TQL request
                    returnObservable = func();
                }
            })
        }
        else{
            //auth not expired

            //check if tql token has expired
            if(tqlCheck &&  localStorage.getItem("TQL_TOKEN_EXPIRY") &&
                        parseInt(localStorage.getItem("TQL_TOKEN_EXPIRY")) < (new Date()).valueOf()
                   ){
                    
                    this.activateUser().subscribe(res => {
                        //TQL token subscribed 
                        returnObservable = func();
                    })
                }
                else{
                    // Probably not a TQL request or none of the tokens expired
                    returnObservable = func();
                }
        }

        return returnObservable;
    }


    


    /**
     * Tasks to execute after successfull Authentication
     * @param response 
     */
    private postAuthSuccess(response){
        
            //save Authorization Header
            //console.error(res);
            if(response.access_token){
                this.api.storeAuthToken(response.access_token, response.expiry, response.refresh_token);
                
            }
            
            
            //this.refreshToken = response.refresh_token;
            this.api.loadTokens();
        }



}