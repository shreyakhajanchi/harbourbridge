import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TargetDetails } from 'src/app/app.constants';

import { TargetDetailsFormComponent } from './target-details-form.component';

describe('TargetDetailsFormComponent', () => {
  let component: TargetDetailsFormComponent;
  let fixture: ComponentFixture<TargetDetailsFormComponent>;
  let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<TargetDetailsFormComponent>>;

  beforeEach(async () => {
    mockMatDialogRef = jasmine.createSpyObj<MatDialogRef<TargetDetailsFormComponent>>('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      declarations: [ TargetDetailsFormComponent ],
      providers: [
        { provide: MatDialogRef, useValue: mockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        FormBuilder
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    localStorage.setItem(TargetDetails.TargetDB,'testValue');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize the targetDetailsForm with a targetDb FormControl', () => {
    expect(component.targetDetailsForm.get('targetDb')).toBeTruthy();
  });

  it('should set the initial value of targetDb to the value in localStorage', () => {
    
    const targetDbValue = 'testValue';
    spyOn(localStorage, 'getItem').and.returnValue(targetDbValue);
    expect(component.targetDetailsForm.get('targetDb')).not.toBeNull(); // Add null check
    expect(component.targetDetailsForm.get('targetDb')!.value).toEqual(targetDbValue);
  });

  it('should call localStorage.setItem when updateTargetDetails is called', () => {
    const targetDbValue = 'testValue';
    spyOn(localStorage, 'setItem');
    component.targetDetailsForm.setValue({
      targetDb: targetDbValue,
    });

    component.updateTargetDetails();
    expect(localStorage.setItem).toHaveBeenCalledWith('targetDb', targetDbValue);
    expect(localStorage.setItem).toHaveBeenCalledWith('isTargetDetailSet', 'true');
    expect(mockMatDialogRef.close).toHaveBeenCalled();
  });
});
