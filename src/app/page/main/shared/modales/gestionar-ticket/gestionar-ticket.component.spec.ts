import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarTicketComponent } from './gestionar-ticket.component';

describe('GestionarTicketComponent', () => {
  let component: GestionarTicketComponent;
  let fixture: ComponentFixture<GestionarTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
