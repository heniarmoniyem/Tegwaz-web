import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdminAccountComponent } from './view-admin-account.component';

describe('ViewAdminAccountComponent', () => {
  let component: ViewAdminAccountComponent;
  let fixture: ComponentFixture<ViewAdminAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAdminAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAdminAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
