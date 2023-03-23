import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import IConv from 'src/app/model/conv';
import { IRule } from 'src/app/model/rule';
import { DataService } from 'src/app/services/data/data.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import data from 'src/data';

@Component({
  selector: 'app-edit-column-max-length',
  templateUrl: './edit-column-max-length.component.html',
  styleUrls: ['./edit-column-max-length.component.scss']
})
export class EditColumnMaxLengthComponent implements OnInit {
  @Input() ruleNameValid: boolean = false
  @Input() ruleName: string = ''
  @Input() ruleType: string = ''
  @Output() resetRuleType: EventEmitter<any> = new EventEmitter<any>()
  editColMaxLengthForm: FormGroup
  ruleId: string = ''
  tableNames: string[] = []
  viewRuleData: any = []
  viewRuleFlag: boolean = false
  conv: IConv = {} as IConv
  spTypes: string[] = ['STRING','BYTES']
  constructor(private fb: FormBuilder, private data: DataService, private sidenav: SidenavService) {
    this.editColMaxLengthForm = this.fb.group({
      tableName: ['', Validators.required],
      column: ['allColumn', Validators.required],
      spDataType: ['', Validators.required],
      maxColLength: ['', Validators.required],
    })
   }

  ngOnInit(): void {
    this.data.conv.subscribe({
      next: (res: IConv) => {
        this.conv = res
        this.tableNames = Object.keys(res.SpSchema)
        this.tableNames.push('All table')
      },
    })
    this.sidenav.sidenavAddIndexTable.subscribe({
      next: (res: string) => {
        this.editColMaxLengthForm.controls['tableName'].setValue(res)
      },
    })

    this.sidenav.passRules.subscribe(([data, flag]: any) => {
      this.viewRuleData = data
      this.viewRuleFlag = flag

      if (this.viewRuleFlag) {
        this.ruleId = this.viewRuleData?.Id
        this.editColMaxLengthForm.controls['tableName'].setValue(this.viewRuleData?.Data?.Table)
        this.editColMaxLengthForm.controls['maxColLength'].setValue(this.viewRuleData?.Data?.Name)
        this.editColMaxLengthForm.disable()
      }
    })
  }

  formSubmit(): void {
    const ruleValue = this.editColMaxLengthForm.value
    const data : Record<string, string> = {}
    data[ruleValue.spDataType]=ruleValue.maxColLength
    let payload: IRule = {
      name: this.ruleName,
      type: 'edit_column_max_length',
      objectType: 'Table',
      associatedObjects: ruleValue.tableName,
      enabled: true,
      data: data,
    }
    
    this.data.applyRule(payload)
    this.resetRuleType.emit('')
    this.sidenav.closeSidenav()
  }

  deleteRule() {
    this.data.dropRule(this.ruleId)
    this.resetRuleType.emit('')
    this.sidenav.closeSidenav()
  }
}
