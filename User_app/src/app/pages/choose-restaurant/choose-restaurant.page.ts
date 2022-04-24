
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ApisService } from 'src/app/services/apis.service';
import { UtilService } from 'src/app/services/util.service';
@Component({
  selector: 'app-choose-restaurant',
  templateUrl: './choose-restaurant.page.html',
  styleUrls: ['./choose-restaurant.page.scss'],
})
export class ChooseRestaurantPage implements OnInit {
  restaurants: any[] = [];
  dummyRest: any = [];
  constructor(
    private router: Router,
    public api: ApisService,
    public util: UtilService) {
    this.getRestaurant();
  }

  ngOnInit() {

  }

  goToAddReview(item) {
    const navData: NavigationExtras = {
      queryParams: {
        id: item.uid,
        name: item.name
      }
    };
    this.router.navigate(['/add-review'], navData);
  }


  protected resetChanges = () => {
    this.restaurants = this.dummyRest;
  }

  setFilteredItems() {
    console.log('clear');
    this.restaurants = [];
    this.restaurants = this.dummyRest;
  }

  filterItems(searchTerm) {
    return this.restaurants.filter((item) => {
      return item.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });

  }
  onSearchChange(event) {
    this.resetChanges();
    this.restaurants = this.filterItems(event.detail.value);
  }

  getRestaurant() {
    const param = {
      lat: localStorage.getItem('lat'),
      lng: localStorage.getItem('lng'),
      distance: 10,
      type: 1
    };
    this.api.post('stores/nearMe', param).then((data: any) => {
      console.log(data);
      if (data && data.status === 200 && data.data.length > 0) {
        data.data = data.data.filter(x => x.status === '1');
        data.data.forEach(element => {
          element.rating = parseFloat(element.rating);
          element.time = parseInt(element.time);
          element.dish = parseInt(element.dish);
          this.restaurants.push(element);
          this.dummyRest.push(element);
        });
      }
    }, error => {
      console.log(error);
      this.dummyRest = [];
    }).catch(error => {
      console.log(error);
      this.dummyRest = [];
    });
  }
}
