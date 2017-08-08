import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from "rxjs";

import { AppComponent } from './app.component';
import { RealTimeParkingService } from "./project/services";

class FakeParkingService{
  getAllParkingSpaces(){}
}

describe('AppComponent', () => {
  let realTimeParkingService: RealTimeParkingService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [
        {
          provide: RealTimeParkingService,
          useClass: FakeParkingService
        }
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();

    
    realTimeParkingService = TestBed.get(RealTimeParkingService);
    spyOn(realTimeParkingService, 'getAllParkingSpaces').and.callFake( ()=>{
      return new Observable( obs => { obs.next(mockParkingResponse)});
    });
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'Cisco Smart + CDP'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Cisco Smart + CDP');
  }));

  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    let comp = fixture.componentInstance;
    comp.ngOnInit();
    //fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    //expect(compiled.querySelector('h1').textContent).toContain('Welcome to Cisco Smart + CDP!');
  }));

  it("should list the ParkingSpaces", async( ()=>{
    

    const fixture = TestBed.createComponent(AppComponent);
    let comp = fixture.componentInstance;
    comp.ngOnInit();
    const compiled = fixture.debugElement.nativeElement;

    

    //fixture.detectChanges();
    
  }));
 
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
