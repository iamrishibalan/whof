import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
declare var $: any;
import * as moment from 'moment';
import { CartService } from 'src/app/services/cart.service';

// import time from "../../../assets/time.json";
@Component({
  selector: 'app-select-time',
  templateUrl: './select-time.page.html',
  styleUrls: ['./select-time.page.scss'],
})
export class SelectTimePage implements OnInit {
  Bookingtimes = [
    {
      "id": 1,
      "times": "9:00 AM",
      "action": true

    },
    {
      "id": 2,
      "times": "10:00 AM",
      "action": true
    },
    {
      "id": 3,
      "times": "11:00 AM",
      "action": true
    },
    {
      "id": 4,
      "times": "12:00 PM",
      "action": true
    },
    {
      "id": 5,
      "times": "1:00 PM",
      "action": true
    },
    {
      "id": 6,
      "times": "2:00 PM",
      "action": true
    },
    {
      "id": 7,
      "times": "3:00 PM",
      "action": true
    },
    {
      "id": 8,
      "times": "4:00 PM",
      "action": true
    },
    {
      "id": 9,
      "times": "5:00 PM",
      "action": true
    },
    {
      "id": 10,
      "times": "6:00 PM",
      "action": true
    },
    {
      "id": 11,
      "times": "7:00 PM",
      "action": true
    },
    {
      "id": 12,
      "times": "8:00 PM",
      "action": true
    },
    {
      "id": 13,
      "times": "9:00 PM",
      "action": true
    }
  ]
  date: string;
  type: 'string';
  str: any;
  str1: any;
  str2: any;
  hide: boolean;
  timeshow: boolean;
  value: any = 0;
  dates: any;
  times: any;
  haveItems: Array<any> = [];
  Chooseddate: any = 0;
  nonshow10a: boolean = false;
  show10a: boolean = true;
  nonshow11a: boolean = false;
  show11a: boolean = true;
  nonshow12p: boolean = false;
  show12p: boolean = true;
  timess: any;
  allDate: any;
  // timedata: any;
  // choosedDate: any = 0;
  // choosedTime: any = 0;
  // nonchoosed: boolean = false;
  // choosed: boolean = false;


  constructor(private navCtrl: NavController, public api: ApisService, public util: UtilService,public cart: CartService,) {
    // this.timedata = time;
  }

  ngOnInit() {

  }


  choosetime(e) {
    this.value = e.target.innerHTML;
    let data = this.Bookingtimes.filter(x => x.times.trim() == this.value.trim());
    if (data.length != 0 && data[0].action != false) {
      this.timess = this.value
      
    }
    else {
      this.timess = 1;
      
    }

  }
  onChange($event) {
    this.Bookingtimes = [
      {
        "id": 1,
        "times": "9:00 AM",
        "action": true

      },
      {
        "id": 2,
        "times": "10:00 AM",
        "action": true
      },
      {
        "id": 3,
        "times": "11:00 AM",
        "action": true
      },
      {
        "id": 4,
        "times": "12:00 PM",
        "action": true
      },
      {
        "id": 5,
        "times": "1:00 PM",
        "action": true
      },
      {
        "id": 6,
        "times": "2:00 PM",
        "action": true
      },
      {
        "id": 7,
        "times": "3:00 PM",
        "action": true
      },
      {
        "id": 8,
        "times": "4:00 PM",
        "action": true
      },
      {
        "id": 9,
        "times": "5:00 PM",
        "action": true
      },
      {
        "id": 10,
        "times": "6:00 PM",
        "action": true
      },
      {
        "id": 11,
        "times": "7:00 PM",
        "action": true
      },
      {
        "id": 12,
        "times": "8:00 PM",
        "action": true
      },
      {
        "id": 13,
        "times": "9:00 PM",
        "action": true
      }
    ]   
    let val = $event._d;
    this.str = moment(val, 'DD-MM-YYYY').add(1, 'days').utc(false).format('DD-MM-YYYY');
    this.str1 = moment(val, 'DD-M-YYYY').add(1, 'days').utc(false).format('DD-M-YYYY');
    this.hide = false;
    this.timeshow = true;
    let allDate = new Date();
    let day = allDate.getDate();
    let mon = allDate.getMonth() + 1;
    let year = allDate.getFullYear();
    let FullDaty = day + '-' + mon + '-' + year;
    this.str2 = FullDaty;
    console.log(FullDaty);
    if (this.str1 == this.str2) {
      var d = new Date(),
        h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
        m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
      let mm = '00';
      var value = h + ':' + mm;
      const timeString = value
      const timeString12hr = new Date('1970-01-01T' + timeString + 'Z')
        .toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: true, hour: 'numeric', minute: 'numeric' });
      console.log(timeString12hr);
      let datas = this.Bookingtimes.filter(x => x.times.trim() == timeString12hr.trim());
      let datass = this.Bookingtimes.filter(x => x.id <= datas[0].id);
      for (let i = 0; i < this.Bookingtimes.length; i++) {
        if (datass.length != 0) {
          let data = datass.filter(x=>x.times == this.Bookingtimes[i].times);
          if(data.length != 0){
            this.Bookingtimes[i].action = false;
            console.log(this.Bookingtimes[i]);
          }
        }
      }
    }
    const param = {
      id: this.str
    }
    console.log(param)
    this.api.post('orders/getByDate', param).then((data: any) => {
      if (data.message == "Success") {
        this.haveItems = data.data.filter(x=> x.status !='cancel');
        if (this.Bookingtimes.length != 0) {
          for (let i = 0; i < this.Bookingtimes.length; i++) {
            if (this.haveItems.length != 0) {
              let data = this.haveItems.filter(x => x.time.trim() == this.Bookingtimes[i].times.trim());
              if (data.length != 0) {
                this.Bookingtimes[i].action = false;
                console.log(this.Bookingtimes[i]);
              }
            }

          }
        }
      }
      else {
        this.haveItems = [];
      }
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }

  back() {
    this.navCtrl.back();
  }
  submit1() {
    this.hide = true;
    this.timeshow = false;
  }

  Booknow() {
    if (this.timess != '1') {
      this.date = this.str;
      this.times = this.timess;
      localStorage.setItem('times', this.times);
      localStorage.setItem('dates', this.date);
      const navData: NavigationExtras = {
        queryParams: {
          date: this.date,
          time: this.times,
        }
      };
      this.navCtrl.navigateRoot(['tabs/tab4'], navData);
    }
    else {
      this.util.errorToast(this.util.translate('Choose Available Time'));
    }

  }
}
