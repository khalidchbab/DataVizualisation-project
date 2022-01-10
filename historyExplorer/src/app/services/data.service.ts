import {
  Injectable
} from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class DataService {


  constructor() {
  }
  getHistory(){
    return d3.csv("../../../assets/_files/idk.csv")
  }

  getRealHistory(){
    return d3.csv("../../../assets/_files/myHistoryEdited.csv")
  }
}
