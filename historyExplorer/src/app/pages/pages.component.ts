import {
  Component, ElementRef, ViewChild
} from "@angular/core";

@Component({
  selector: "ngx-pages",
  styleUrls: ["pages.component.scss"],
  templateUrl: './pages.component.html',
})
export class PagesComponent {
  @ViewChild('target2')
  target2: ElementRef | any;

  menu: any[] = [];
  charachterId: number = 0;
  choose1: boolean = true
  choose2: boolean = true
  choose3: boolean = true
  charachterChoosen: boolean = false

  dataInNumbers = [[55942,37,46,17],[84192,69,24,7],[40231,25,38,37]]
  chiffre:any = [55942,37,46,17]
  constructor() {

  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }

  scroll2(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }


  choosed(id: any) {
    if (id == 1) {
      this.choose2 = false
      this.choose3 = false
      this.choose1 = true
      this.charachterChoosen = true
      this.charachterId = id -1
      this.chiffre = this.dataInNumbers[id-1]
    } else if (id == 2) {
      this.choose1 = false
      this.choose3 = false
      this.choose2 = true
      this.charachterChoosen = true
      this.charachterId = id -1
      this.chiffre = this.dataInNumbers[id-1]
    } else {
      this.choose1 = false
      this.choose3 = true
      this.choose2 = false
      this.charachterChoosen = true
      this.charachterId = id -1
      this.chiffre = this.dataInNumbers[id-1]
    }
  }

  redoCharachter() {
    this.choose2 = true
    this.choose3 = true
    this.choose1 = true
    this.charachterChoosen = false
  }
}
