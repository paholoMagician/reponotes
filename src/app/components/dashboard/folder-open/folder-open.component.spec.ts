import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderOpenComponent } from './folder-open.component';

describe('FolderOpenComponent', () => {
  let component: FolderOpenComponent;
  let fixture: ComponentFixture<FolderOpenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FolderOpenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FolderOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
