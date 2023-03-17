import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SourceDetailsFormComponent } from './source-details-form.component';

describe('SourceDetailsFormComponent', () => {
  let component: SourceDetailsFormComponent;
  let fixture: ComponentFixture<SourceDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourceDetailsFormComponent ],
      imports: [HttpClientModule, MatDialogModule, MatSnackBarModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('form validation', () => {
    it('should have a form with required fields', () => {
      const form = component.directConnectForm;
      expect(form.contains('hostName')).toBeTruthy();
      expect(form.contains('port')).toBeTruthy();
      expect(form.contains('userName')).toBeTruthy();
      expect(form.contains('dbName')).toBeTruthy();
      expect(form.contains('password')).toBeTruthy();
      expect(form.controls['hostName'].valid).toBeFalsy();
      expect(form.controls['port'].valid).toBeFalsy();
      expect(form.controls['userName'].valid).toBeFalsy();
      expect(form.controls['dbName'].valid).toBeFalsy();
      expect(form.controls['password'].valid).toBeTruthy();
    });
});
});
