import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbcdddComponent } from './abcddd.component';

describe('AbcdddComponent', () => {
  let component: AbcdddComponent;
  let fixture: ComponentFixture<AbcdddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbcdddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbcdddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
