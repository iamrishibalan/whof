
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import * as moment from 'moment';
import { ApisService } from 'src/app/services/apis.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
})
export class AnalyticsPage implements OnInit {
  @ViewChild('invoiceTicket', { read: ElementRef, static: false }) private invoiceTicket: ElementRef;
  storecommission: any;
  from: any;
  to: any;
  allOrders: any[] = [];
  storeOrder: any[] = [];
  totalAmount: any = 0;
  commisionAmount: any = 0;
  toPay: any = 0;
  apiCalled: boolean;
  storename: any;

  totalAmountsFromOrder: any = 0;
  constructor(
    public util: UtilService,
    public api: ApisService,
    private printService: Printer,
  ) {

  }

  ngOnInit() {
  }

  getStats() {
    this.storename = this.util.store.name;
    this.storecommission = parseFloat(this.util.store.commission);
    if (this.from && this.to) {
      this.from = moment(this.from).format('YYYY-MM-DD');
      this.to = moment(this.to).format('YYYY-MM-DD');
      const param = {
        sid: localStorage.getItem('uid'),
        start: this.from + ' 00:00:00',
        end: this.to + ' 23:59:59'
      };
      console.log(param);
      this.util.show();
      this.apiCalled = false;
      this.storeOrder = [];
      this.api.post('orders/storeStats', param).then((data: any) => {
        this.apiCalled = true;
        this.util.hide();
        console.log(data);


        if (data && data.status === 200 && data.data.length) {
          let total = 0;
          this.storeOrder = [];
          data.data.forEach(async (element) => {
            if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.orders)) {

              if (element.status === 'delivered') {
                element.orders = JSON.parse(element.orders);
                element.date_time = moment(element.date_time).format('dddd, MMMM Do YYYY');
                total = total + parseFloat(element.total);
                this.storeOrder.push(element);
              }
            }
          });
          console.log(this.storeOrder);
          console.log(total);
          setTimeout(() => {
            function percentage(num, per) {
              return (num / 100) * per;
            }
            console.log(this.storeOrder);
            console.log(total, this.storecommission);
            const totalPrice = percentage(total, parseFloat(this.storecommission));
            console.log('commistion=====>>>>>', totalPrice.toFixed(2));
            this.commisionAmount = totalPrice.toFixed(2);
            this.totalAmount = total;
            this.toPay = this.totalAmount - this.commisionAmount;
          }, 1000);

        }
      }, error => {
        this.util.hide();
        console.log(error);
        this.apiCalled = true;
        this.util.errorToast(this.util.translate('Something went wrong'));
      });
    } else {
      this.util.errorToast(this.util.translate('All Fields are required'));
    }
  }

  print() {
    const content = this.invoiceTicket.nativeElement.innerHTML;
    console.log('content', content);
    const options: PrintOptions = {
      name: 'S2ftech App Summary',
      duplex: false,
    };
    this.printService.print(content, options).then((data) => {
      console.log(data);
    }).catch(error => {
      console.log(error);
    });
  }

  today() {
    return moment().format('ll');
  }
  getDate(date) {
    return moment(date).format('ll');
  }

  getCommisions(total) {
    return ((parseFloat(total) * this.storecommission) / 100).toFixed(2);
  }
}
