import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { PrepareMigrationComponent } from './prepare-migration.component';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Dataflow, InputType, MigrationDetails, MigrationModes, MigrationTypes } from 'src/app/app.constants';

describe('PrepareMigrationComponent', () => {
  let component: PrepareMigrationComponent;
  let fixture: ComponentFixture<PrepareMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrepareMigrationComponent],
      imports: [HttpClientModule, MatDialogModule, MatSnackBarModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepareMigrationComponent);
    component = fixture.componentInstance;
    component.dialect = 'PostgreSQL'
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize variables', () => {
    expect(component.isSourceConnectionProfileSet).toBe(false);
    expect(component.isTargetConnectionProfileSet).toBe(false);
    expect(component.isDataflowConfigurationSet).toBe(false);
    expect(component.isSourceDetailsSet).toBe(false);
    expect(component.isTargetDetailSet).toBe(false);
    expect(component.isMigrationDetailSet).toBe(false);
    expect(component.isStreamingSupported).toBe(false);
    expect(component.hasDataMigrationStarted).toBe(false);
    expect(component.hasSchemaMigrationStarted).toBe(false);
    expect(component.hasForeignKeyUpdateStarted).toBe(false);
    expect(component.selectedMigrationMode).toBe(MigrationModes.schemaAndData);
    expect(component.connectionType).toBe(InputType.DirectConnect);
    expect(component.selectedMigrationType).toBe(MigrationTypes.lowDowntimeMigration);
    expect(component.isMigrationInProgress).toBe(false);
    expect(component.isLowDtMigrationRunning).toBe(false);
    expect(component.isResourceGenerated).toBe(false);
    expect(component.generatingResources).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.schemaProgressMessage).toBe('Schema migration in progress...');
    expect(component.dataProgressMessage).toBe('Data migration in progress...');
    expect(component.foreignKeyProgressMessage).toBe('Foreign key update in progress...');
    expect(component.dataMigrationProgress).toBe(0);
    expect(component.schemaMigrationProgress).toBe(0);
    expect(component.foreignKeyUpdateProgress).toBe(0);
    expect(component.sourceDatabaseName).toBe('');
    expect(component.sourceDatabaseType).toBe('');
    expect(component.resourcesGenerated).toEqual({
      DatabaseName: '',
      DatabaseUrl: '',
      BucketName: '',
      BucketUrl: '',
      DataStreamJobName: '',
      DataStreamJobUrl: '',
      DataflowJobName: '',
      DataflowJobUrl: ''
    });
    expect(component.region).toBe('');
    expect(component.instance).toBe('');
    expect(component.dialect).toBe('PostgreSQL');
    expect(component.nodeCount).toBe(0);
    expect(component.processingUnits).toBe(0);
    expect(component.displayedColumns).toEqual(['Title', 'Source', 'Destination']);
    expect(component.dataSource).toEqual([]);
    expect(component.migrationModes).toEqual([]);
    expect(component.migrationTypes).toEqual([]);
  });

  it('should display the correct breadcrumb links', () => {
    const breadcrumbSourceLink = fixture.debugElement.query(
      By.css('.breadcrumb_source')
    );
    const breadcrumbWorkspaceLink = fixture.debugElement.query(
      By.css('.breadcrumb_workspace')
    );
    const breadcrumbPrepareMigrationLink = fixture.debugElement.query(
      By.css('.breadcrumb_prepare_migration')
    );
    expect(breadcrumbSourceLink.nativeElement.innerText).toBe('Select Source');
    expect(breadcrumbWorkspaceLink.nativeElement.innerText).toContain(
      'Configure Schema('
    );
    expect(breadcrumbWorkspaceLink.nativeElement.innerText).toContain(
      'PostgreSQL Dialect)'
    );
    expect(breadcrumbPrepareMigrationLink.nativeElement.innerText).toContain(
      'Prepare Migration'
    );
  });

  it('should refresh for schema mode', () => {
    component.selectedMigrationMode = MigrationModes.schemaOnly
    component.refreshMigrationMode();
    expect(component.selectedMigrationType).toEqual(MigrationTypes.bulkMigration)
  });

  

  it('should initialize properties from localStorage', () => {
    initializeLocalstorage()
    component.initializeFromLocalStorage()
    expect(component.selectedMigrationMode).toBe('testMode')
    expect(component.selectedMigrationType).toBe('testType')
    expect(component.isMigrationInProgress).toBe(true)
    expect(component.isTargetDetailSet).toBe(true)
    expect(component.isSourceConnectionProfileSet).toBe(true)
    expect(component.isDataflowConfigurationSet).toBe(true)
    expect(component.isTargetConnectionProfileSet).toBe(true)
    expect(component.isSourceDetailsSet).toBe(true)
    expect(component.isMigrationDetailSet).toBe(true)
    expect(component.hasSchemaMigrationStarted).toBe(true)
    expect(component.hasDataMigrationStarted).toBe(true)
    expect(component.dataMigrationProgress).toBe(50)
    expect(component.schemaMigrationProgress).toBe(25)
    expect(component.dataProgressMessage).toBe('testDataMessage')
    expect(component.schemaProgressMessage).toBe('testSchemaMessage')
    expect(component.foreignKeyProgressMessage).toBe('testForeignKeyMessage')
    expect(component.foreignKeyUpdateProgress).toBe(75)
    expect(component.hasForeignKeyUpdateStarted).toBe(true)
    expect(component.generatingResources).toBe(true)
  });

  it('should remove all relevant items from local storage', () => {
    // Call the function to clear local storage
    component.clearLocalStorage();

    // Check that all relevant items have been removed from local storage
    expect(localStorage.getItem(MigrationDetails.MigrationMode)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.MigrationType)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.IsTargetDetailSet)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.IsSourceConnectionProfileSet)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.IsTargetConnectionProfileSet)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.IsSourceDetailsSet)).toBeNull();
    expect(localStorage.getItem(Dataflow.IsDataflowConfigSet)).toBeNull();
    expect(localStorage.getItem(Dataflow.Network)).toBeNull();
    expect(localStorage.getItem(Dataflow.Subnetwork)).toBeNull();
    expect(localStorage.getItem(Dataflow.HostProjectId)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.IsMigrationInProgress)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.HasSchemaMigrationStarted)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.HasDataMigrationStarted)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.DataMigrationProgress)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.SchemaMigrationProgress)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.DataProgressMessage)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.SchemaProgressMessage)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.ForeignKeyProgressMessage)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.ForeignKeyUpdateProgress)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.HasForeignKeyUpdateStarted)).toBeNull();
    expect(localStorage.getItem(MigrationDetails.GeneratingResources)).toBeNull();
  });

});

function initializeLocalstorage() {
  localStorage.setItem(MigrationDetails.MigrationMode, 'testMode')
    localStorage.setItem(MigrationDetails.MigrationType, 'testType')
    localStorage.setItem(MigrationDetails.IsMigrationInProgress, 'true')
    localStorage.setItem(MigrationDetails.IsTargetDetailSet, 'true')
    localStorage.setItem(MigrationDetails.IsSourceConnectionProfileSet, 'true')
    localStorage.setItem(Dataflow.IsDataflowConfigSet, 'true')
    localStorage.setItem(MigrationDetails.IsTargetConnectionProfileSet, 'true')
    localStorage.setItem(MigrationDetails.IsSourceDetailsSet, 'true')
    localStorage.setItem(MigrationDetails.IsMigrationDetailSet, 'true')
    localStorage.setItem(MigrationDetails.HasSchemaMigrationStarted, 'true')
    localStorage.setItem(MigrationDetails.HasDataMigrationStarted, 'true')
    localStorage.setItem(MigrationDetails.DataMigrationProgress, '50')
    localStorage.setItem(MigrationDetails.SchemaMigrationProgress, '25')
    localStorage.setItem(MigrationDetails.DataProgressMessage, 'testDataMessage')
    localStorage.setItem(MigrationDetails.SchemaProgressMessage, 'testSchemaMessage')
    localStorage.setItem(MigrationDetails.ForeignKeyProgressMessage, 'testForeignKeyMessage')
    localStorage.setItem(MigrationDetails.ForeignKeyUpdateProgress, '75')
    localStorage.setItem(MigrationDetails.HasForeignKeyUpdateStarted, 'true')
    localStorage.setItem(MigrationDetails.GeneratingResources, 'true')
}
