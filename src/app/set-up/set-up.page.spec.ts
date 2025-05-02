import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetUpPage } from './set-up.page';

describe('SetUpPage', () => {
  let component: SetUpPage;
  let fixture: ComponentFixture<SetUpPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SetUpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
