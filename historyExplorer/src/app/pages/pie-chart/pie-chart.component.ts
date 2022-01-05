import { Component, OnInit } from '@angular/core';
import { PieChartService } from './../../services/pie-chart.service';
import * as d3 from 'd3';
// import {PieChart} from "@d3/pie-chart" ; 

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {

  // constructor() {}

  
  // d3.json(data_got).then(function (json)
  // private data = [
  //   {"Framework": "Vue", "Stars": "166443", "Released": "2014"},
  //   {"Framework": "React", "Stars": "150793", "Released": "2013"},
  //   {"Framework": "Angular", "Stars": "62342", "Released": "2016"},
  //   {"Framework": "Backbone", "Stars": "27647", "Released": "2010"},
  //   {"Framework": "Ember", "Stars": "21471", "Released": "2011"},
  // ];
  private data: any ; 

  constructor(private pieChartService:PieChartService) {
  
    // PieChartService.get_test().then((data:any) => {
      
    //   this.data = data
    //   console.log(this.data)
    // })
    // console.log(this.data)
  }

  private svg: any;
  private margin = 50;
  private width = 750;
  private height = 600;
  // The radius of the pie chart is half the smallest side
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors: any;
  // private stroke = innerRadius > 0 ? "none" : "white" ; 
  // private padAngle: any ; 


  
  private createSvg(): void {
    this.svg = d3.select("figure#pie")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + this.width / 2 + "," + this.height / 2 + ")"
    );
  }

  private createColors(): void {
    this.colors = d3.scaleOrdinal()
    .domain(this.data.map((d:any) => d.Stars.toString()))
    .range(d3.schemePaired);
  }

  private drawChart(): void {
    // Compute the position of each group on the pie:
    const pie = d3.pie<any>().value((d: any) => Number(d.Stars));

    // Build the pie chart
    this.svg
    .selectAll('pieces')
    .data(pie(this.data))
    .enter()
    .append('path')
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(this.radius)
    )
    .attr('fill', (d: any, i: any) => (this.colors(i)))
    // .attr("stroke", "#121926")
    // .style("stroke-width", "1px")
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 1);

    // Add labels
    const labelLocation = d3.arc()
    .innerRadius(100)
    .outerRadius(this.radius);

    this.svg
    .selectAll('pieces')
    .data(pie(this.data))
    .enter()
    .append('text')
    .text((d: { data: { Framework: any; }; }) => d.data.Framework)
    .attr("transform", (d: d3.DefaultArcObject) => "translate(" + labelLocation.centroid(d) + ")")
    .style("text-anchor", "middle")
    .style("font-size", 15);
  }


  ngOnInit(): void {
    this.pieChartService.get_test().then((data:any) => {
      
      this.data = data
      console.log(this.data)
      this.createSvg();
      this.createColors();
      this.drawChart();
    })
    
  }


}
