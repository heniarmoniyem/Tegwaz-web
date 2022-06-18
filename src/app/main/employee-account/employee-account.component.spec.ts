import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAccountComponent } from './employee-account.component';

describe('EmployeeAccountComponent', () => {
  let component: EmployeeAccountComponent;
  let fixture: ComponentFixture<EmployeeAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
