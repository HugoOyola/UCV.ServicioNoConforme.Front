import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaAreaComponent } from './vista-area.component';

describe('VistaAreaComponent', () => {
  let component: VistaAreaComponent;
  let fixture: ComponentFixture<VistaAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
