import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class PieChartService {

  constructor() {
    
   }

   get_test(){
    return d3.json("../../../assets/pieChart_v1_data.json")  // test_data.json // pieChart_v1_data
  }

}
