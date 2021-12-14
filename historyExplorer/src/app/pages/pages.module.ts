import { PagesComponent } from './pages.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { PagesRoutingModule } from "./pages-routing.module";



@NgModule({
  declarations: [
    PagesComponent,
    BarChartComponent
  ],
  imports: [
    PagesRoutingModule,
    CommonModule
  ]
})
export class PagesModule { }
