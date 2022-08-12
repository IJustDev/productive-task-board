import { TestBed } from '@angular/core/testing';

import { ProductiveService } from './productive.service';

describe('ProductiveService', () => {
  let service: ProductiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
