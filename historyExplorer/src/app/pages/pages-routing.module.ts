import { BarChartComponent } from './bar-chart/bar-chart.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { BubbleChartComponent } from './bubble-chart/bubble-chart.component';

import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { PagesComponent } from "./pages.component";
import { GraphChartComponent } from './graph-chart/graph-chart.component';
import { DayChartComponent } from './day-chart/day-chart.component';
import { MainPageComponent } from './main-page/main-page.component';

const routes: Routes = [
  {
    path: "",
    component: PagesComponent,
    children: [
      {
        path: "dashboard",
        component: BarChartComponent,
      },
      {
        path: "piechart",
        component: PieChartComponent,
      },
      {
        path: "graphchart",
        component: GraphChartComponent,
      },
      {
        path: "bubblechart",
        component: BubbleChartComponent,
      },
      {
        path: "daychart",
        component: DayChartComponent,
      },
      {
        path: "",
        component: MainPageComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}
