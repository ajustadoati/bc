import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddWorkshopModalPage } from './add-workshop-modal.page';

describe('AddWorkshopModalPage', () => {
  let component: AddWorkshopModalPage;
  let fixture: ComponentFixture<AddWorkshopModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWorkshopModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
