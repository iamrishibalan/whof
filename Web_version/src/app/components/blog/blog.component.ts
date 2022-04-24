
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  tabID = '';

  blogs: any;
  dummy: any = Array(10);
  constructor(
    private router: Router,
    public api: ApiService,
    public util: UtilService
  ) {
    this.getBlogs();
  }

  ngOnInit(): void { }

  goToBlogDetail(item) {
    console.log(item);
    const param: NavigationExtras = {
      queryParams: {
        id: item.id,
        title: item.title.replace(/\s+/g, '-').toLowerCase()
      }
    }
    this.router.navigate(['/blog-detail'], param);
  }

  getBlogs() {
    this.api.get('blogs').then((data: any) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status === 200 && data.data.length) {
        this.blogs = data.data.filter(x => x.status === '1');
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.errorMessage(this.util.translate('Something went wrong'));
    }).catch((error: any) => {
      console.log(error);
      this.dummy = [];
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  getContent(item) {
    return (item.content.length > 50) ? item.content.slice(0, 50) + '...' : item.content;
  }


  getDate(item) {
    return moment(item).format('DD');
  }

  getMonth(item) {
    return moment(item).format('MMM');
  }

}
