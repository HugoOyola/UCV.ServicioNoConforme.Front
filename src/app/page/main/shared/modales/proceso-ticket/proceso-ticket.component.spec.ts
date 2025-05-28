import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcesoTicketComponent } from './proceso-ticket.component';

describe('ProcesoTicketComponent', () => {
  let component: ProcesoTicketComponent;
  let fixture: ComponentFixture<ProcesoTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcesoTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcesoTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
