
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { CartService } from 'src/app/services/cart.service';
@Component({
  selector: 'app-headers',
  templateUrl: './headers.component.html',
  styleUrls: ['./headers.component.scss']
})
export class HeadersComponent implements OnInit {

  activeTab = 'home';
  headerMode: boolean;
  activeFilter: any;
  totalRest: any;

  languages: any;
  selectedLanguage: any;
  constructor(
    private router: Router,
    public api: ApiService,
    public util: UtilService,
    private chmod: ChangeDetectorRef,
    private cart: CartService) {
    this.headerMode = false;
    this.selectedLanguage = 'English';
    this.getLangs();
    this.util.subscribeHeader().subscribe(data => {
      if (data) {
        this.headerMode = data.header;
        this.totalRest = data.total;
        if (data && data.active !== undefined) {
          this.activeFilter = data.active;
        }
      }

      this.chmod.detectChanges();
    });
  }

  addFilter(item) {
    this.activeFilter = item;
    this.util.publishFilterCode(item);
  }

  changeLanguage(value) {
    const item = this.languages.filter(x => x.file === value.file);
    if (item && item.length > 0) {
      localStorage.setItem('language', value.file);
      window.location.reload();
    }
  }

  haveLocation() {
    const location = localStorage.getItem('location');
    if (location && location != null && location !== 'null') {
      return true;
    }
    return false;
  }

  haveSigned() {
    const uid = localStorage.getItem('uid');
    if (uid && uid != null && uid !== 'null') {
      return true;
    }
    return false;
  }

  getLangs() {
    this.api.get('lang').then((data: any) => {
      console.log('data--->>> languages??===??', data);
      if (data && data.status === 200 && data.data.length) {
        this.languages = data.data;
        const lng = localStorage.getItem('language');
        if (lng && lng !== null && lng !== '') {
          const selectedLang = this.languages.filter(x => x.file === lng);
          console.log('selected language', selectedLang);
          if (selectedLang && selectedLang.length) {
            this.selectedLanguage = selectedLang[0].name;
          }
        } else {
          const defaultLanguages = this.languages.filter(x => x.is_default === '1');
          if (defaultLanguages && defaultLanguages.length) {
            this.selectedLanguage = defaultLanguages[0].name;
          }
        }
      } else {
        this.selectedLanguage = 'English';
      }
    }, error => {
      console.log(';error in languge', error);
      this.selectedLanguage = 'English';
    }).catch((error => {
      console.log('error->>>', error);
      this.selectedLanguage = 'English';
    }))
  }

  ngOnInit(): void {
  }

  goToHome() {
    this.activeTab = 'home';
    this.router.navigate(['/restaurants']);
  }

  goToSearch() {
    this.activeTab = 'search';
    this.router.navigate(['/search']);
  }

  goToOffers() {
    this.activeTab = 'offers';
    this.router.navigate(['/offers']);
  }

  goToSettings(item) {
    this.activeTab = 'settings';
    const name = (this.util.userInfo.first_name + '-' + this.util.userInfo.last_name).toLowerCase();
    this.router.navigate(['user', name, item]);
  }

  goToAccount() {
    this.activeTab = 'account';
    this.router.navigate(['/account']);
  }

  goToCart() {
    this.activeTab = 'cart';
    this.router.navigate(['/cart']);
  }

  getAddress() {
    const location = localStorage.getItem('address');
    if (location && location != null && location !== 'null') {
      return location.length > 30 ? location.slice(0, 30) + '....' : location;;
    }
    return this.util.translate('Choose your Location');
  }

  logout() {
    localStorage.removeItem('uid');
    this.cart.cart = [];
    this.cart.itemId = [];
    this.cart.totalPrice = 0;
    this.cart.grandTotal = 0;
    this.cart.coupon = null;
    this.cart.discount = null;
    this.util.clearKeys('cart');
    this.router.navigate(['']);
  }

  goToHelp() {
    this.activeTab = 'help';
    this.router.navigate(['help']);
  }

  goToFaqs() {
    this.activeTab = 'faq';
    this.router.navigate(['faq']);
  }
}
