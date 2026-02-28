import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeReleaseRequestComponent } from './code-release-request.component';

describe('CodeReleaseRequestComponent', () => {
  let component: CodeReleaseRequestComponent;
  let fixture: ComponentFixture<CodeReleaseRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeReleaseRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeReleaseRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
