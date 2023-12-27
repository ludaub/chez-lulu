import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppStore } from '@app/app.store.service';

describe('AppStore', () => {
  let service: AppStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppStore);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });
});
