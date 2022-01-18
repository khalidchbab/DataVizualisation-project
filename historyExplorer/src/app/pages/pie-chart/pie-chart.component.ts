import {
  DataService
} from './../../services/data.service';
import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import * as d3 from 'd3';
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
  OuhmaidService
} from 'src/app/services/ouhmaid.service';
import {
  PieChartService
} from 'src/app/services/pie-chart.service';


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
  DynamicData: any;
  
  form: FormGroup;
  options: any = ["Adnane DR","Khalid CH",  "Khalid OUH"];
  filteredOptions: Observable < string[] > ;
  max:Date = new Date("01/10/2022")
  min:Date = new Date("10/13/2021")

  @Input() item:number = 0;
  ngOnChanges() {
    this.changeData();    
}


  constructor(private dataService: DataService,
    private ouhmaidData: OuhmaidService,
    private adnaneData: PieChartService,
    private builder: FormBuilder) {

      this.form = builder.group({
        start: builder.control(new Date("01/01/2022")),
        end: builder.control(this.max),
        person: builder.control("Khalid CH")
      });
      this.filteredOptions = of (this.options);
      this.filteredOptions = this.form.controls.person.valueChanges
        .pipe(startWith(''), map((filterString: any) => this.filter(filterString)));
    this.dataService.getRealHistory().then((res: any) => {
      this.data = res
      this.DynamicData = this.filterDate(this.data, "01/01/2022", "01/10/2022")
      this.DynamicData = this.reduceData(this.DynamicData);

      this.svg = d3.select("figure#pie")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
        .attr(
          "transform",
          "translate(" + this.width / 2 + "," + this.height / 2 + ")"
        );

        this.form.controls.end.valueChanges.subscribe(() => {
          this.changed()
        });
    
        this.form.controls.person.valueChanges.subscribe(() => {
          this.changeData()
        });
    
        this.change(this.DynamicData);
    })

  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((optionValue: any) => optionValue.toLowerCase().includes(filterValue));
  }

  changeData() {
    if (this.options[this.item] == "Khalid CH") {
      this.dataService.getRealHistory().then((res: any[]) => {
        this.data = res
        this.changed()
      })
    } else if(this.options[this.item] == "Adnane DR"){
      this.adnaneData.getAdnaneRealHistory().then((res: any[]) => {
        this.data = res
        this.changed()
      })
    } else {
      this.ouhmaidData.getOuhmaidRealHistory().then((res: any[]) => {
        this.data = res
        this.changed()
      })
    }
  }

  

  changed() {
    if (this.form.controls.end.value != null) {
    let start = this.getDate(this.form.controls.start.value);
    let end = this.getDate(this.form.controls.end.value);
      this.DynamicData = this.data
      this.DynamicData = this.filterDate(this.DynamicData, start, end)
      this.DynamicData = this.reduceData(this.DynamicData);
      this.change(this.DynamicData)
    } else if(this.form.controls.end.value == null && this.form.controls.start.value == null) {
      this.DynamicData = this.data
      this.DynamicData = this.filterDate(this.DynamicData, "01/01/2022", "01/10/2022")
      this.DynamicData = this.reduceData(this.DynamicData);
      this.change(this.DynamicData)
    }
  }

  getDate(date: Date) {
    if (date == null)
      return null;
    console.log(date)
    let fixNumber = (n: number) => (n > 9 ? n + "" : "0" + n);
    return `${fixNumber(date.getMonth() + 1)}/${fixNumber(date.getDate())}/${date.getFullYear()}`;
  }


  // randomData() {
  //   var labels = this.data.map((d: any) => d[0]);
  //   // console.log(labels);

  //   return labels.map(function (label: any) {
  //     return {
  //       Website: label,
  //       Count: Math.floor(Math.random() * 1000)
  //     }
  //   });
  // }

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
    return sortable.slice(0, 6)
  }

  filterDate(data: any, start: any, end: any) {
    start = new Date(start);
    end = new Date(end);
    let filterByData = data.filter((d: any) => {
      return (start <= new Date(d.date) && new Date(d.date) <= end)
    });
    return filterByData;
  }




  change(data: any) {
    this.svg.selectAll("*").remove()

    // console.log('I\'m inside change function  ! ');
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
      .domain(data.map((d: any) => d[1].toString()))
      .range(d3.schemePaired);

    var pie = d3.pie()
      .sort(null)
      .value((d: any) => {
        return d[1];
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
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("z-index", "100")
      .style("visibility", "hidden")
      .style("padding", "10px")
      .style("background", "#fff")
      .style("border-radius", "5px")
      .style("color", "#000")
      .text("a simple tooltip");

    var slice = this.svg.select(".slices").selectAll("path.slice")
      .data(pie(data), (d: any) => {
        return d[0]
      }).enter()
      .insert("path")
      .style("fill", (d: any) => {
        console.log(d)
        return this.colors(d.data[0]);
      })
      .attr("class", "slice")
      .on('mouseover', (event: any, d: any) => {
        ;

        tooltip.html(`Visited Count: ${d.data[1]}`).style("visibility", "visible");
        d3.select(event.currentTarget).transition()
          .duration(50)
          .attr('opacity', '1')
      })
      .on("mousemove", (event: any, d: any) => {
        tooltip
          .style("top", (event.pageY + 20) + "px")
          .style("left", (event.pageX + 30) + "px");
      })
      .on('mouseout', (event: any, d: any) => {
        tooltip.style('visibility', 'hidden')
        d3.select(event.currentTarget).transition()
          .duration(50)
          .attr('opacity', '0.75')
      });
    // console.log(slice)
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
      .data(pie(data), (d: any) => {
        return d[0]
      }).enter()
      .append("text")
      .attr("fill", "#fff")
      .attr("dy", ".35em")
      .text(function (d: any) {
        return d.data[0];
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
      .data(pie(data), (d: any) => {
        return d[0]
      }).enter()
      .append("polyline")

    polyline.attr("stroke", "#fff")
      .attr("fill", "none")
      .attr("opacity", .5)
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
