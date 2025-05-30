import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaCoordinadorComponent } from './vista-coordinador.component';

describe('VistaCoordinadorComponent', () => {
  let component: VistaCoordinadorComponent;
  let fixture: ComponentFixture<VistaCoordinadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaCoordinadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaCoordinadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
