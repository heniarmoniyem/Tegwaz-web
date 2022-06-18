import { TestBed } from '@angular/core/testing';

import { MyTripService } from './my-trip.service';

describe('MyTripService', () => {
  let service: MyTripService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyTripService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
