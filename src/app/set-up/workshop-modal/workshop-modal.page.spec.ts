import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkshopModalPage } from './workshop-modal.page';

describe('WorkshopModalPage', () => {
  let component: WorkshopModalPage;
  let fixture: ComponentFixture<WorkshopModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkshopModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
