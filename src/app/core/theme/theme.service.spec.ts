import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from '@app/core/theme/theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });
});
