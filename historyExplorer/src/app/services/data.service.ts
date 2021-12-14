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

  get_covid(){
    return d3.csv("https://www.data.gouv.fr/fr/datasets/r/63352e38-d353-4b54-bfd1-f1b3ee1cabd7")
  }

  get_map(){
    return d3.json("https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson")
  }
}
