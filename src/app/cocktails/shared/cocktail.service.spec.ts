import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CocktailService } from '@app/cocktails/shared/cocktail.service';

describe('CocktailService', () => {
  let service: CocktailService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CocktailService);
  });

  test('the service is created', () => {
    expect(service).toBeTruthy();
  });
});
