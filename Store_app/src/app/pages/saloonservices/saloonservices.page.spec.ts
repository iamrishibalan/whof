import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SaloonservicesPage } from './saloonservices.page';

describe('SaloonservicesPage', () => {
  let component: SaloonservicesPage;
  let fixture: ComponentFixture<SaloonservicesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaloonservicesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SaloonservicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
