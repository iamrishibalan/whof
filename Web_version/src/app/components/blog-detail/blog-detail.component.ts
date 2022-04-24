
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiService } from 'src/app/services/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ThrowStmt } from '@angular/compiler';
import { Location } from '@angular/common';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {

  title: any;
  cover: any;
  cotent: any;
  id: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: Location,
    public api: ApiService,
    private util: UtilService
  ) {
    this.route.queryParams.subscribe((data) => {
      if (data && data.id) {
        this.id = data.id;
        this.getById();
      }
    });
  }

  getById() {
    const param = {
      id: this.id
    };

    this.api.post('blogs/getById', param).then((data: any) => {
      console.log(data);
      if (data && data.status === 200 && data.data && data.data.length) {
        const info = data.data[0];
        console.log(info);
        this.title = info.title;
        this.cotent = info.content;
        this.cover = info.cover;
      } else {
        this.navCtrl.back();
        this.util.errorMessage(this.util.translate('Something went wrong'));
      }
    }).catch((error) => {
      console.log(error);
      this.navCtrl.back();
      this.util.errorMessage(this.util.translate('Something went wrong'));
    });
  }

  ngOnInit(): void { }

  goToRestDetail() {
    this.router.navigate(['/rest-detail']);
  }



}
