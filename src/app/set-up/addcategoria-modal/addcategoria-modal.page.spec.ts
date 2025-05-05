import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddcategoriaModalPage } from './addcategoria-modal.page';

describe('AddcategoriaModalPage', () => {
  let component: AddcategoriaModalPage;
  let fixture: ComponentFixture<AddcategoriaModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddcategoriaModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
