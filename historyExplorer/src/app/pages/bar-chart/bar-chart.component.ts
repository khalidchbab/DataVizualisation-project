import {
  DataService
} from './../../services/data.service';
import {
  Component,
  OnInit
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent {

  data: any;
  svg: any;
  private margin = 50;
  private width = 750;
  private height = 400;

  constructor(private dataService: DataService) {
    this.dataService.getHistory().then((res: any[]) => {
      this.data = res
      console.log(this.data.length)
      this.svg = d3.select("figure#bar")
        .append("svg")
        .attr("width", this.width + (50 * 4))
        .attr("height", this.height + (50 * 4))
        .append("g")
        .attr("transform", "translate(" + 50 + "," + 50 + ")");
      this.drawBars(this.data)
    })
  }

  drawBars(data: any[]) {
    const x = d3.scaleBand()
    .range([0, this.width])
    .domain(data.map(d => d.website))
    .padding(0.2);

    // Draw the X-axis on the DOM
    this.svg.append("g")
    .attr("transform", "translate(0," + this.height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
    .domain([0, data[0].count])
    .range([this.height, 0]);

    console.log(data)

    // Draw the Y-axis on the DOM
    this.svg.append("g")
    .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll("bars")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d:any) => x(d.website))
    .attr("y", (d:any) => y(Number(d.count)))
    .attr("width", x.bandwidth())
    .attr("height", (d:any) => this.height - y(Number(d.count)))
    .attr("fill", "#d04a35");
  }

  dynamicSort(property:any) {
    var sortOrder = -1;
    if(property[0] === "-") {
        sortOrder = 1;
        property = property.substr(1);
    }
    return function (a:any,b:any) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
  }
}

}
