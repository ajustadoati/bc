import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GastosListPage } from './gastos-list.page';

describe('GastosListPage', () => {
  let component: GastosListPage;
  let fixture: ComponentFixture<GastosListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GastosListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
