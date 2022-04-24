
import { Component, OnInit } from '@angular/core';
import { ApisService } from 'src/app/services/apis.service';
import { AlertController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage implements OnInit {
  categories: any[] = [];
  dummy = Array(50);
  constructor(
    public api: ApisService,
    private alertController: AlertController,
    public util: UtilService,
    private router: Router,
  ) {
    this.getCategories();
  }

  getCategories() {
    const param = {
      id: localStorage.getItem('uid')
    };
    this.api.post('categories/getByRestId', param).then((data: any) => {
      this.dummy = [];
      if (data && data.status === 200 && data.data.length) {
        this.categories = data.data;
      }
    }, error => {
      console.log(error);
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      console.log(error);
      this.dummy = [];
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  ngOnInit() {
  }
  async addNewCat() {
    const alert = await this.alertController.create({
      header: this.util.translate('Add New!'),
      mode: 'ios',
      inputs: [
        {
          name: 'name1',
          type: 'text',
          placeholder: this.util.translate('Category Name'),
        },
      ],
      buttons: [
        {
          text: this.util.translate('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: this.util.translate('Ok'),
          handler: (data) => {
            console.log('Confirm Ok', data);
            if (data && data.name1 !== '') {
              console.log('add new');
              const param = {
                restId: localStorage.getItem('uid'),
                name: data.name1,
                status: 1
              };
              this.util.show();
              this.api.post('categories/save', param).then((datas: any) => {
                console.log(datas);
                this.util.hide();
                if (datas && datas.status === 200) {
                  this.getCategories();
                  const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });

                  Toast.fire({
                    icon: 'success',
                    title: this.util.translate('saved')
                  });
                } else {
                  this.util.errorToast(this.util.translate('Something went wrong'));
                }
              }, error => {
                console.log(error);
                this.util.hide();
                this.util.errorToast(this.util.translate('Something went wrong'));
              }).catch(error => {
                console.log(error);
                this.util.hide();
                this.util.errorToast(this.util.translate('Something went wrong'));
              });
            }
          }
        }
      ]
    });

    await alert.present();

    // this.router.navigate(['/add-category'])
  }
  async edit(item) {
    // console.log(item);
    const alert = await this.alertController.create({
      header: this.util.translate('Edit'),
      mode: 'ios',
      inputs: [
        {
          name: 'name1',
          type: 'text',
          placeholder: this.util.translate('Category Name'),
          value: item.name
        },
      ],
      buttons: [
        {
          text: this.util.translate('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: this.util.translate('Ok'),
          handler: (data) => {
            console.log('Confirm Ok', data);
            if (data && data.name1 !== '') {
              console.log('add new');
              const param = {
                id: item.id,
                name: data.name1,
              };
              this.util.show();
              this.api.post('categories/editList', param).then((datas: any) => {
                console.log(datas);
                this.util.hide();
                if (datas && datas.status === 200) {
                  this.getCategories();
                  const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });

                  Toast.fire({
                    icon: 'success',
                    title: this.util.translate('saved')
                  });
                } else {
                  this.util.errorToast(this.util.translate('Something went wrong'));
                }
              }, error => {
                console.log(error);
                this.util.hide();
                this.util.errorToast(this.util.translate('Something went wrong'));
              }).catch(error => {
                console.log(error);
                this.util.hide();
                this.util.errorToast(this.util.translate('Something went wrong'));
              });

            }
          }
        }
      ]
    });

    await alert.present();
  }

  deleteItem(item) {
    Swal.fire({
      title: this.util.translate('Are you sure'),
      text: this.util.translate('to delete') + ' ' + item.name + ' ?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: this.util.translate('Delete'),
      backdrop: false,
      background: 'white'
    }).then(status => {
      if (status && status.value) {
        const param = {
          id: item.id,
        };
        this.util.show();
        this.api.post('categories/deleteList', param).then((datas: any) => {
          console.log(datas);
          this.util.hide();
          if (datas && datas.status === 200) {
            this.getCategories();
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: true,
              onOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });

            Toast.fire({
              icon: 'success',
              title: this.util.translate('deleted')
            });
          } else {
            this.util.errorToast(this.util.translate('Something went wrong'));
          }
        }, error => {
          console.log(error);
          this.util.hide();
          this.util.errorToast(this.util.translate('Something went wrong'));
        }).catch(error => {
          console.log(error);
          this.util.hide();
          this.util.errorToast(this.util.translate('Something went wrong'));
        });
      }
    });
  }

  hideStatus(item) {
    const param = {
      id: item.id,
      status: item.status === '1' ? 0 : 1
    };
    this.util.show();
    this.api.post('categories/editList', param).then((datas: any) => {
      console.log(datas);
      this.util.hide();
      if (datas && datas.status === 200) {
        this.getCategories();
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          onOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });

        Toast.fire({
          icon: 'success',
          title: this.util.translate('saved')
        });
      } else {
        this.util.errorToast(this.util.translate('Something went wrong'));
      }
    }, error => {
      console.log(error);
      this.util.hide();
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }
}
