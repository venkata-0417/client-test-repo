import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetPasswordNewComponent } from './forget-password-new.component';

describe('ForgetPasswordNewComponent', () => {
  let component: ForgetPasswordNewComponent;
  let fixture: ComponentFixture<ForgetPasswordNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForgetPasswordNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgetPasswordNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
