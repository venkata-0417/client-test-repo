import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeReleaseComponent } from './code-release.component';

describe('CodeReleaseComponent', () => {
  let component: CodeReleaseComponent;
  let fixture: ComponentFixture<CodeReleaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeReleaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
