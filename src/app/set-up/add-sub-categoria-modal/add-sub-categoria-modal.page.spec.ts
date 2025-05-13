import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSubCategoriaModalPage } from './add-sub-categoria-modal.page';

describe('AddSubCategoriaModalPage', () => {
  let component: AddSubCategoriaModalPage;
  let fixture: ComponentFixture<AddSubCategoriaModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSubCategoriaModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
