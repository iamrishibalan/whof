
import { Component,OnInit } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  store : boolean =  false;
  salon : boolean =  false;
  storeAnal: boolean =  false;
  salonAnal: boolean =  false;
  constructor() { }

ngOnInit(){
  
}

}
