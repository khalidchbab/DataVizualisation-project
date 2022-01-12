import {
  OuhmaidService
} from './../../services/ouhmaid.service';
import {
  Component,
  ViewEncapsulation,
  OnInit
} from '@angular/core';
import * as d3 from 'd3';
import * as d3S from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Axis from 'd3-axis';
import * as d3Array from 'd3-array';
import {
  color,
  rgb
} from 'd3';

import {
  FormBuilder,
  FormGroup
} from '@angular/forms';
import {
  Observable,
  of
} from 'rxjs';
import {
  map,
  startWith
} from "rxjs/operators";

import {
  DataService
} from 'src/app/services/data.service';
import {
  PieChartService
} from 'src/app/services/pie-chart.service';



// import {PieChart} from "@d3/pie-chart" ; 

@Component({
  selector: 'app-bubble-chart',
  encapsulation: ViewEncapsulation.None,

  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.scss']
})
export class BubbleChartComponent {

  data: any;
  svg: any;
  g: any;
  tooltip: any;
  circle: any;
  colors: any;
  items: any;
  layout: any;
  form: FormGroup




  private margin = 50;
  private width = 750;
  private height = 400;
  xScale = d3.scaleLinear()
  constructor(private dataService: DataService,
    private ouhmaidData: OuhmaidService,
    private adnaneData: PieChartService,
    private builder: FormBuilder) {

    this.form = builder.group({
      start: builder.control(null),
      end: builder.control(null),
      person: builder.control("Khalid OU")
    });

    this.ouhmaidData.getOuhmaidRealHistory().then((res: any) => {



      this.data = res
      this.data = this.reduceData(this.data);

      console.log(this.data)
      this.svg = d3.select("figure#bubble")
        .append("svg")
        .attr("width", this.width + (50 * 4))
        .attr("height", this.height + (50 * 4))
        .append("g")
        .attr("transform", "translate(" + 50 + "," + 50 + ")");
      this.drawCircles(this.data)

    })



  }

  /*  changeData() {
     if (this.form.controls.person.value == "Khalid CH") {
       this.dataService.getRealHistory().then((res: any[]) => {
         this.data = res
         console.log("Khalid : ", this.data)
         this.changed()
       })
     } else if(this.form.controls.person.value == "Adnane DR"){
       this.adnaneData.getAdnaneRealHistory().then((res: any[]) => {
         this.data = res
         console.log("Adnane : ", this.data)
         this.changed()
       })
     } else {
       this.ouhmaidData.getOuhmaidRealHistory().then((res: any[]) => {
         this.data = res
         console.log("Ouhmaid : ", this.data)
         this.changed()
       })
     }
   } */



  filterDate(data: any, start: any, end: any) {
    start = new Date(start);
    end = new Date(end);
    let filterByData = data.filter((d: any) => {
      return (start <= new Date(d.date) && new Date(d.date) <= end)
    });
    return filterByData;
  }

  reduceData(data: any) {
    let counts = data.reduce((p: any, c: any) => {
      let name = c.website;
      if (!p.hasOwnProperty(name)) {
        p[name] = 0;
      }
      p[name]++;
      return p;
    }, {});
    let sortable = [];
    for (let entry in counts) {
      sortable.push([entry, counts[entry]]);
    }

    sortable.sort(function (a, b) {
      return b[1] - a[1];
    });
    return sortable.slice(0, 10)
  }

  drawCircles(data: any[]) {

    let colors = d3.scaleOrdinal()
      .domain(this.data.map((d: any) => d[0].toString()))
      .range(d3.schemePaired);


    let rScale = d3.scaleLinear().domain([0, data[0][1]])
      .range([20, 100]);
    console.log(data[0][1]);
    
    this.xScale.domain([0, data[0][1]])
      .range([20, 500]);

    this.data = this.data.map((item: any, index: any) => ({
      ...item,
      id: index
    }));
    console.log(this.data);
    let layout = this.buildSpiralLayout(data);
    console.log(layout);

    const tootltip = d3.select(".tootltipEmp").append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    let g = this.svg.append('g').attr('transform', 'translate(200,200)');



    let items = g.selectAll('g.item')
      .data(layout, (d: any) => d.id)
      .enter()
      .append('g')
      .classed('item', true)
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .on('mousemove', (event: any, d: any) => {
        tootltip.transition()
          .duration(200)
          .style('opacity', .9);
        tootltip.html('Website : ' + d[0] + '<br/>' + 'Visited : ' + d[1])
          .style('left', (event.pageX + 30) + 'px')
          .style('top', (event.pageY + 50) + 'px');
      }).on('mouseout', (event: any, d: any) => {
        tootltip.transition()
          .duration(500)
          .style('opacity', 0);
      })

    items.append('circle')
      //.attr("r", function(d: any) { return d[1]; })
      //.style("fill", function(d: any) { return rgb(d[1]); });
      .attr('r', (d: any) => rScale(d[1]))
      // .style("fill", function(d: any, i: any) { return color(d.size); });
      //.style('fill', function(d:any) { return color(d[1]);});
      //.style("fill",'red')
      .style("fill", function (d: any, i: any) {
        return colors(i);
      })


    items.append('text')
      .text((d: any) => d[0])
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')


  }

  checkIntersection(nodes: any, node: any, angle: any, radius: any) {
    const x = radius * Math.sin(angle);
    const y = radius * -Math.cos(angle);
    return nodes.some((n: any) => Math.hypot(n.x - x, n.y - y) <= n[1] + node[1]);
  };


  buildSpiralLayout(nodes: any[]) {
    const ordered = nodes.sort((a, b) => a[1] - b[1]);
    let angle = 0;
    let radius = 10;
    return ordered.reduce((all, node, index) => {
      angle = (index === 0) ? 0 : angle + Math.PI / 3;
      while (this.checkIntersection(all, node, angle, radius)) radius++;
      const x = this.xScale(radius * Math.sin(angle));
      const y = this.xScale(radius * -Math.cos(angle));
      all.push({
        ...node,
        x,
        y
      });
      return all;
    }, []);
  }



  /* drawCircles(data: any[])
    {
        let y = d3.scaleLinear().domain([0,1000000]).range([10,0])
      this.g=this.svg.selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function(d: any, i: any) {
         return "translate(0,0)";
      })
  
      this.g.append("circle").attr("cx", function(d: any, i: any) {
          console.log(i)
          return i*75 + 50;
       })
       .attr("cy", function(d: any, i: any) {
          return 75;
       })
       .attr("r", function(d: any) {
          return d[1];
       })
       
       .attr("fill", (d: any, i: any) =>{
          return this.colors[i];
       })
       
       this.g.append("text").attr("x", function(d: any, i: any) {
          return i * 75 + 25;
       })
       
       .attr("y", 80)
       .attr("stroke", "teal")
       .attr("font-size", "10px")
       .attr("font-family", "sans-serif").text(function(d: any) {
          return d.Framework;
       });
  
    } */








}
