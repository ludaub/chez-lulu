import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailDetailDialogComponent } from '@app/cocktails/cocktail-detail-dialog/cocktail-detail-dialog.component';

describe('CocktailDetailDialogComponent', () => {
  let component: CocktailDetailDialogComponent;
  let fixture: ComponentFixture<CocktailDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CocktailDetailDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CocktailDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('the component is created', () => {
    expect(component).toBeTruthy();
  });
});
