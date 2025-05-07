import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubCategoriaModalPage } from './sub-categoria-modal.page';

describe('SubCategoriaModalPage', () => {
  let component: SubCategoriaModalPage;
  let fixture: ComponentFixture<SubCategoriaModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubCategoriaModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
