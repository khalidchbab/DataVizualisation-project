import { DataService } from './../../services/data.service';
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent {
  width = 700;
  height = 580;

  svg = d3
    .select("body")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height);

  g : any;
  projection: any;
  colors: any = ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"]
  color : any;
  path: any
  tooltip: any
  daysArray:any = []
  daysArraySet: boolean = false
  legendScale:any;
  constructor(dataService:DataService) {
    this.g = this.svg.append("g");

    this.projection = d3.geoConicConformal().center([2.454071, 46.279229])
    .translate([this.width / 2, this.height / 2]).scale(3000);

    this.color = d3.scaleQuantize().range(this.colors);
    this.path = d3.geoPath().projection(this.projection);
    this.tooltip = d3.select('body').append('div').attr('class', 'hidden tooltip');
    dataService.get_covid().then((data:any) => {
      this.color.domain([
          d3.min(data, (d:any) => {
              return d.hosp;
          }),
          d3.max(data, (d:any)=> {
              return d.hosp;
          })
      ]);
  
      dataService.get_map().then((json:any) => {
          if (this.daysArraySet == false) {
              let i = 0
              while (data[i].dep == 1) {
                  this.daysArray.push(data[i].jour);
                  i++;
              }
  
              d3.select('#day').html(this.daysArray[0]);
              d3.select('#slider').attr("max", i - 1);
  
              this.daysArraySet = true;
          }
          d3.select("#slider").on("input", ( val) => {
              this.updateViz(json, data, val);
          });
          this.drawMap(json, data, this.daysArray[0])
  
          
      var legend = this.svg.append('g')
          .attr('transform', 'translate(625, 150)')
          .attr('id', 'legend');
  
      legend.selectAll('.colorbar')
          .data(d3.range(5))
          .enter().append('svg:rect')
          .attr('y', d => d * 20 + 'px')
          .attr('height', '20px')
          .attr('width', '20px')
          .attr('x', '0px')
          .attr('fill', d => this.colors[d])  
      });
      
  });
  }


  updateViz(json: any, data: any, value: number) {
    d3.select('#day').html(this.daysArray[value]);
    this.drawMap(json, data, this.daysArray[value]);
  }

  drawMap(json: any, data: string | any[], currentWeek: any) {
    let map = this.svg.selectAll("path").data(json.features);
    for (let i = 0; i < data.length; i++) {
      let dataDep = data[i].dep;
      let dataDay = data[i].jour
      let dataValue = parseInt(data[i].hosp);
      for (let j = 0; j < json.features.length; j++) {
        let jsonDep = json.features[j].properties.code;
        if (dataDep == jsonDep && dataDay == currentWeek) {
          json.features[j].properties.reg = data[i].Region
          json.features[j].properties.value = dataValue;
          break;
        }
      }
    }
    map.attr("class", "department").style("fill",  (d:any) => {
      return d.properties.value ? this.color(d.properties.value) : "#ccc"
    })

  map.enter()
    .append("path")
    .attr('id', (d:any) => "dep-" + d.properties.nom)
    .attr("d", this.path)
    .attr("class", (d: any) => "department")
    .style("fill",  (d:any) => {
      return d.properties.value ? this.color(d.properties.value) : "#ccc"
    })
    .on('mousemove', (event: any, d:any) => {
      let mousePosition = d3.pointer(event);
      this.tooltip.classed('hidden', false)
        .attr('style', 'left:' + (mousePosition[0] + 15) +
          'px; top:' + (mousePosition[1] - 35) + 'px')
        .html("<b>Région : </b>" + d.properties.reg + "<br>" +
          "<b>Département : </b>" + d.properties.nom + "<br>" +
          "<b>Hospitalisation : </b>" + d.properties.value + "<br>");
    })
    .on('mouseout', () => {
      this.tooltip.classed('hidden', true);
    });

  }
}
