import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperadoresDetailsPage } from './operadores-details.page';

describe('OperadoresDetailsPage', () => {
  let component: OperadoresDetailsPage;
  let fixture: ComponentFixture<OperadoresDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OperadoresDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
