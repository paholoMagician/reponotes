import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowFunctionComponent } from './window-function.component';

describe('WindowFunctionComponent', () => {
  let component: WindowFunctionComponent;
  let fixture: ComponentFixture<WindowFunctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WindowFunctionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WindowFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
