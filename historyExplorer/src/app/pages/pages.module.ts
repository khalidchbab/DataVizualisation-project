import { BrowserModule } from '@angular/platform-browser';
import { PagesComponent } from './pages.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { PagesRoutingModule } from "./pages-routing.module";
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { GraphChartComponent } from './graph-chart/graph-chart.component';
import { BubbleChartComponent } from './bubble-chart/bubble-chart.component';

import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';

@NgModule({
  declarations: [
    PagesComponent,
    BarChartComponent,
    PieChartComponent,
    GraphChartComponent,
    BubbleChartComponent
  ],
  imports: [
    PagesRoutingModule,
    CommonModule, 
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule
  ]
})
export class PagesModule { }
