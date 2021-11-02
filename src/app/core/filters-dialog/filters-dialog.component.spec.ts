import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersDialogComponent } from '@app/core/filters-dialog/filters-dialog.component';
import { SharedModule } from '@app/shared/shared.module';

describe('FiltersDialogComponent', () => {
  let component: FiltersDialogComponent;
  let fixture: ComponentFixture<FiltersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [FiltersDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('the component is created', () => {
    expect(component).toBeTruthy();
  });
});
