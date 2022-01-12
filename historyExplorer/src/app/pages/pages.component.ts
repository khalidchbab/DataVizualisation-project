import {
  Component
} from "@angular/core";

@Component({
  selector: "ngx-pages",
  styleUrls: ["pages.component.scss"],
  templateUrl: './pages.component.html',
})
export class PagesComponent {
  menu: any[] = [];
  constructor() {

  }

  choose1: boolean = true
  choose2: boolean = true
  choose3: boolean = true
  charachterChoosen: boolean = false

  choosed(id: any) {
    if (id == 1) {
      this.choose2 = false
      this.choose3 = false
      this.choose1 = true
      this.charachterChoosen = true
    } else if (id == 2) {
      this.choose1 = false
      this.choose3 = false
      this.choose2 = true
      this.charachterChoosen = true

    } else {
      this.choose1 = false
      this.choose3 = true
      this.choose2 = false
      this.charachterChoosen = true

    }
  }

  redoCharachter() {
    this.choose2 = true
    this.choose3 = true
    this.choose1 = true
    this.charachterChoosen = false

  }
}
