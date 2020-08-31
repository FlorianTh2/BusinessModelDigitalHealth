import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasCardComponent } from './canvas-card.component';

describe('CanvasCardComponent', () => {
  let component: CanvasCardComponent;
  let fixture: ComponentFixture<CanvasCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanvasCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
