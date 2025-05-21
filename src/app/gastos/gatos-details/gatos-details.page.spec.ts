import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GatosDetailsPage } from './gatos-details.page';

describe('GatosDetailsPage', () => {
  let component: GatosDetailsPage;
  let fixture: ComponentFixture<GatosDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GatosDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
