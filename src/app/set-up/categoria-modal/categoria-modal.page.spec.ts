import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriaModalPage } from './categoria-modal.page';

describe('CategoriaModalPage', () => {
  let component: CategoriaModalPage;
  let fixture: ComponentFixture<CategoriaModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriaModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
