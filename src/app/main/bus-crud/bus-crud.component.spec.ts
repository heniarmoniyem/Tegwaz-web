import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusCrudComponent } from './bus-crud.component';

describe('BusCrudComponent', () => {
  let component: BusCrudComponent;
  let fixture: ComponentFixture<BusCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusCrudComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
