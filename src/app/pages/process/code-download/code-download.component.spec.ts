import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeDownloadComponent } from './code-download.component';

describe('CodeDownloadComponent', () => {
  let component: CodeDownloadComponent;
  let fixture: ComponentFixture<CodeDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeDownloadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
