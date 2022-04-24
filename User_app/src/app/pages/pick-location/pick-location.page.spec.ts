/*
  
*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PickLocationPage } from './pick-location.page';

describe('PickLocationPage', () => {
  let component: PickLocationPage;
  let fixture: ComponentFixture<PickLocationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PickLocationPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PickLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
