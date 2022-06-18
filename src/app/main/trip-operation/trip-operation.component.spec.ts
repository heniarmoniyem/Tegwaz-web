import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripOperationComponent } from './trip-operation.component';

describe('TripOperationComponent', () => {
  let component: TripOperationComponent;
  let fixture: ComponentFixture<TripOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TripOperationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TripOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
