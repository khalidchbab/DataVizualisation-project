import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class OuhmaidService {

  constructor() {
    
   }

   get_test(){
    return d3.json("../../../assets/test.json")
  }

}
