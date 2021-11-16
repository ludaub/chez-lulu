import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CocktailDetailDialogComponent } from '@app/cocktails/cocktail-detail-dialog/cocktail-detail-dialog.component';
import { Cocktail } from '@app/cocktails/shared/cocktail';
import { SharedModule } from '@app/shared/shared.module';

describe('CocktailDetailDialogComponent', () => {
  let component: CocktailDetailDialogComponent;
  let fixture: ComponentFixture<CocktailDetailDialogComponent>;
  const cocktail = new Cocktail('foo', 'foo', 'foo', [{ id: 'foo', quantity: 'foo', unit: 'foo' }], 'foo');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [CocktailDetailDialogComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: cocktail }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CocktailDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
