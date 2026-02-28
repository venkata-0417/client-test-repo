import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeReleaseApproveComponent } from './code-release-approve.component';

describe('CodeReleaseApproveComponent', () => {
  let component: CodeReleaseApproveComponent;
  let fixture: ComponentFixture<CodeReleaseApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeReleaseApproveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeReleaseApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
