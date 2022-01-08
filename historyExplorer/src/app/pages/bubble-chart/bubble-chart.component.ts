import { Component, OnInit ,OnChanges} from '@angular/core';
import { OuhmaidService } from './../../services/ouhmaid.service';
import * as d3 from 'd3';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Scale from 'd3-scale';


// import {PieChart} from "@d3/pie-chart" ; 

@Component({
  selector: 'app-bubble-chart',
  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.scss']
})
export class BubbleChartComponent implements OnInit  {

  data: any
 /*  private data = [
    {"Framework": "Vue", "Stars": "166443", "Released": "2014"},
    {"Framework": "React", "Stars": "150793", "Released": "2013"},
    {"Framework": "Angular", "Stars": "62342", "Released": "2016"},
    {"Framework": "Backbone", "Stars": "27647", "Released": "2010"},
    {"Framework": "Ember", "Stars": "21471", "Released": "2011"},
  ]; */
  private svg:any;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  constructor(private ouhmaidservice:OuhmaidService) {

    this.ouhmaidservice.get_test().then((res: any) => {
      this.data = res
  console.log(this.data);
         
          }) 



   }


      ngOnInit(): void {
        this.ouhmaidservice.get_test().then((data:any) => {
          
        this.data = data
        this.createSvg();
        this.drawPlots();
         console.log(this.data)
     })
        
     }
/*   ngOnInit() {
    this.createSvg();
    this.drawPlots();
  }
 */
  createSvg(){
    this.svg = d3.select("figure#bubble")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  };
  drawPlots(){
    //Adding X axis
    const x = d3.scaleLinear()
    .domain([2009, 2017])
    .range([ 0, this.width ]);
    this.svg.append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Adding Y axis
    const y = d3.scaleLinear()
    .domain([0, 200000])
    .range([ this.height, 0]);
    this.svg.append("g")
    .call(d3.axisLeft(y));

    // Adding dots
    const dots = this.svg.append('g');
    dots.selectAll("dot")
    .data(this.data)
    .enter()
    .append("circle")
    .attr("cx", (data: { Released: d3.NumberValue; }) => x(data.Released))
    .attr("cy", (data: { Stars: d3.NumberValue; }) => y(data.Stars))
    .attr("r", 3)
    .style("opacity", .5)
    .style("fill", "black");

    // Adding labels
    dots.selectAll("text")
    .data(this.data)
    .enter()
    .append("text")
    .text(function(d:any){
      return d.Framework;
    })
    .attr("x", (d: { Released: d3.NumberValue; }) => x(d.Released))
    .attr("y", (d: { Stars: d3.NumberValue; }) => y(d.Stars))
  }
}

