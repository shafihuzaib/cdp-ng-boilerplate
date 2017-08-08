import { Component, OnInit } from '@angular/core';
import {  AuthService } from "./project/services/auth/auth-service";
import { RealTimeParkingService } from "./project/services";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ AuthService, RealTimeParkingService]
})
export class AppComponent implements OnInit {
  title = 'Cisco Smart + CDP';
  parkingSpaces: any;
  username = 'partha@paris.com';
  password = "Cisco_123";
  authenticated:boolean = false;

  constructor(private realTimeParkingService: RealTimeParkingService, private authService: AuthService){}


  ngOnInit(){
    this.authenticated = (localStorage.getItem("USER_ID") )? true : false;
  }

  login(){

    this.authService.login(this.username, this.password).subscribe(r=> {
      this.authenticated = true;
    })

    
  }

  getParkingSpaces(){
    this.authService.activateUser().subscribe(t => {
        this.realTimeParkingService.getAllParkingSpaces().subscribe( r => {
      this.parkingSpaces = r;
    });
      })
  }
}
