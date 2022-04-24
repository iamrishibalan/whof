import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SaloonPage } from './saloon.page';

describe('SaloonPage', () => {
  let component: SaloonPage;
  let fixture: ComponentFixture<SaloonPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaloonPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SaloonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
