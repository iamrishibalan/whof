
import { UtilService } from 'src/app/services/util.service';
import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { ApisService } from 'src/app/services/apis.service';

@Component({
  selector: 'app-select-drivers',
  templateUrl: './select-drivers.page.html',
  styleUrls: ['./select-drivers.page.scss'],
})
export class SelectDriversPage implements OnInit {
  drivers: any[] = [];
  selectedDriver: any = '';
  constructor(
    private navParam: NavParams,
    private modalController: ModalController,
    public api: ApisService,
    public util: UtilService
  ) {
    this.drivers = this.navParam.get('item');
    console.log('drivers->', this.drivers);
    if (this.drivers.length && this.drivers.length > 0) {
      this.selectedDriver = this.drivers[0].id;
    }
  }

  ngOnInit() {
  }
  select() {
    console.log(this.selectedDriver);
    let driver = this.drivers.filter(x => x.id === this.selectedDriver);
    console.log(driver);
    this.modalController.dismiss(driver, 'selected');
  }
  close() {
    this.modalController.dismiss([], 'close');
  }
}
