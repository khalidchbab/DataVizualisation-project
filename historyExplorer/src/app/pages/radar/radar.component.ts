import { Component, Input, OnInit } from '@angular/core';
import {  ViewChild } from "@angular/core";

import {
  ApexAxisChartSeries,
  ApexTitleSubtitle,
  ApexChart,
  ApexXAxis,
  ChartComponent
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  xaxis: ApexXAxis;
};
@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.scss']
})
export class RadarComponent implements OnInit {
  @ViewChild("chart") chart?: ChartComponent | any;
  public chartOptions: Partial<ChartOptions> | any;
  @Input() item:number = 0;

  ngOnChanges() {
        
    this.changeData();    
}

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "Percentage",
          data: [80, 50, 30, 40, 100, 20]
        }
      ],
      chart: {
        height: 350,
        type: "radar"
      },
      xaxis: {
        categories: ["Social Media", "Technical", "Enterntaiment", "Gaming", "Movies", "School"]
      }
    };
  }

  changeData(){
    if(this.item == 0)
    this.chartOptions = {
      series: [
        {
          name: "Percentage",
          data: [50, 40, 70, 10, 100, 65]
        }
      ],
      chart: {
        height: 350,
        type: "radar"
      },
      xaxis: {
        categories: ["Social Media", "Technical", "Enterntaiment", "Gaming", "Movies", "School"]
      }
    };
    else if(this.item == 1)
    this.chartOptions = {
      series: [
        {
          name: "Percentage",
          data: [20, 80, 60, 60, 20, 20]
        }
      ],
      chart: {
        height: 350,
        type: "radar"
      },
      xaxis: {
        categories: ["Social Media", "Technical", "Enterntaiment", "Gaming", "Movies", "School"]
      }
    };
    else
    this.chartOptions = {
      series: [
        {
          name: "Sarah_Xsh",
          data: [90, 10, 60, 0, 80, 10]
        }
      ],
      chart: {
        height: 350,
        type: "radar"
      },
      xaxis: {
        categories: ["Social Media", "Technical", "Enterntaiment", "Gaming", "Movies", "School"]
      }
    };
  }

  ngOnInit(): void {
  }

}
