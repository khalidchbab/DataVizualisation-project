import {
  Component,
  OnInit
} from '@angular/core';
import {
  PieChartService
} from './../../services/pie-chart.service';
import * as d3 from 'd3';
// import {PieChart} from "@d3/pie-chart" ; 

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})


export class PieChartComponent {
  // Verion 2  ////////////////////////////////////////
  data: any;
  svg: any;

  private _current: any;
  // private margin = 50;
  // private width = 750;
  // private height = 600;
  // // The radius of the pie chart is half the smallest side
  // private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors: any;
  ///////////////////////////////////////////////////////

  /// Version 3 /////////////////////////////////////////

  private width = 900;
  private height = 600;
  private radius = Math.min(this.width, this.height) / 2;
  constructor(private pieChartService: PieChartService) {

    this.pieChartService.get_test().then((res: any) => {
      this.data = res
      this.svg = d3.select("figure#pie")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
        .attr(
          "transform",
          "translate(" + this.width / 2 + "," + this.height / 2 + ")"
        );


      // console.log(this.data);

      this.change(this.data);

      d3.select("#time")
        .on("change", () => {
          this.change(this.randomData());

        })

      var users = ['#user1', '#user2', '#user3']

      users.forEach(el => {
        d3.select(el)
          .on("input", () => {
            this.change(this.randomData());

          })
      })


    })



  }

  randomData() {
    var labels = this.data.map((d: any) => d.Website);
    // console.log(labels);

    return labels.map(function (label: any) {
      return {
        Website: label,
        Count: Math.floor(Math.random()*1000)
      }
    });

    // this.pieChartService.get_test().then((res: any) => {
    //   this.data = res
    // })

    // return this.data ; 
  }


  change(data: any) {
    this.svg.selectAll("*").remove()

    console.log('I\'m inside change function  ! ');
    // console.log(data);

    // data = this.randomData();

    // console.log(data);

    this.svg.append("g")
      .attr("class", "slices");
    this.svg.append("g")
      .attr("class", "labels");
    this.svg.append("g")
      .attr("class", "lines");

    // console.log(data.map((d: any) => d.Count.toString()));

    this.colors = d3.scaleOrdinal()
      .domain(data.map((d: any) => d.Count.toString()))
      .range(d3.schemeCategory10);

    var pie = d3.pie()
      .sort(null)
      .value( (d: any) => {
        return d.Count;
      });

    var arc = d3.arc()
      .outerRadius(this.radius * 0.8)
      .innerRadius(this.radius * 0.4);

    var outerArc = d3.arc()
      .innerRadius(this.radius * 0.9)
      .outerRadius(this.radius * 0.9);

    // this.svg.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
    const tooltip = d3.select("#pie")
        .append("div")
        .attr("class","d3-tooltip")
        .style("position", "absolute")
        .style("z-index", "100")
        .style("visibility", "hidden")
        .style("padding", "15px")
        .style("background", "rgba(0,0,0,0.6)")
        .style("border-radius", "5px")
        .style("color", "#fff")
        .text("a simple tooltip");

    var slice = this.svg.select(".slices").selectAll("path.slice")
      .data(pie(data),(d:any)=>{
        return d.Website
      }).enter()
      .insert("path")
      .style("fill", (d: any) => {
        return this.colors(d.data.Website);
      })
      .attr("class", "slice")
      .on('mouseover',  (event :any, d :any ) => {;
        
        tooltip.html(`Data: ${d.value}`).style("visibility", "visible");
        d3.select(event.currentTarget).transition()
          .duration(50)
          .attr('opacity', '.75')
      })
      .on("mousemove",(event: any, d: any) =>{
        tooltip
          .style("top", (event.pageY-10)+"px")
          .style("left",(event.pageX+10)+"px");
      })
      .on('mouseout', (event :any, d :any ) => {
        tooltip.style('visibility', 'hidden')
        d3.select(event.currentTarget).transition()
          .duration(50)
          .attr('opacity', '1')
      });
    console.log(slice)
    slice
      .transition().duration(1000)
      .attrTween("d", (d: any) => {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t: any) {
          return arc(interpolate(t));
        };
      })

    slice.exit()
      .remove();

    /* ------- TEXT LABELS -------*/

    function midAngle(d: any) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    var text = this.svg.select(".labels").selectAll("text")
      .data(pie(data),(d:any)=>{
        return d.Website
      }).enter()
      .append("text")
      .attr("dy", ".35em")
      .text(function (d: any) {
        return d.data.Website;
      });

    text.transition().duration(1000)
      .attrTween("transform", (d: any) => {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return (t: any) => {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = this.radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return "translate(" + pos + ")";
        };
      })
      .styleTween("text-anchor", (d: any) => {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function (t: any) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start" : "end";
        };
      });

    text.exit()
      .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = this.svg.select(".lines").selectAll("polyline")
      .data(pie(data),(d:any)=>{
        return d.Website
      }).enter()
      .append("polyline")

    polyline.attr("stroke", "black")
      .attr("fill", "none")
      .attr("opacity", .3)
      .attr("stroke-width", "2px")

    polyline.transition().duration(1000)
      .attrTween("points", (d: any) => {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return (t: any) => {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = this.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [arc.centroid(d2), outerArc.centroid(d2), pos];
        };
      });

    polyline.exit()
      .remove();

  }





}
