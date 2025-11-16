import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Datenschutz } from './datenschutz';

describe('Datenschutz', () => {
  let component: Datenschutz;
  let fixture: ComponentFixture<Datenschutz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Datenschutz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Datenschutz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
