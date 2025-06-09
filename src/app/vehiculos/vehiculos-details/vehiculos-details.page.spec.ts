import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehiculosDetailsPage } from './vehiculos-details.page';

describe('VehiculosDetailsPage', () => {
  let component: VehiculosDetailsPage;
  let fixture: ComponentFixture<VehiculosDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VehiculosDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
