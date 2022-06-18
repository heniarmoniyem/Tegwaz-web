import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceCrudComponent } from './place-crud.component';

describe('PlaceCrudComponent', () => {
  let component: PlaceCrudComponent;
  let fixture: ComponentFixture<PlaceCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaceCrudComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
