import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddservicePage } from './addservice.page';

describe('AddservicePage', () => {
  let component: AddservicePage;
  let fixture: ComponentFixture<AddservicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddservicePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddservicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
