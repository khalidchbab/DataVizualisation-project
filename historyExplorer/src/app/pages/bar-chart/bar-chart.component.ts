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
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent {
  @Input() item:number = 0;
  data: any;
  svg: any;
  form: FormGroup
  private margin = 50;
  private width = 750;
  private height = 400;
  DynamicData: any;
  x = d3.scaleBand()
  y = d3.scaleLinear()
  options: any = ["Adnane DR","Khalid CH",  "Khalid OUH"];
  filteredOptions: Observable < string[] > ;

  max:Date = new Date("01/10/2022")
  min:Date = new Date("10/13/2021")


  constructor(
    private dataService: DataService,
    private ouhmaidData: OuhmaidService,
    private adnaneData: PieChartService,
    private builder: FormBuilder) {
    this.form = builder.group({
      start: builder.control(null),
      end: builder.control(null),
      person: builder.control("Khalid CH")
    });
    this.filteredOptions = of (this.options);
    this.filteredOptions = this.form.controls.person.valueChanges
      .pipe(startWith(''), map((filterString: any) => this.filter(filterString)));
    this.dataService.getRealHistory().then((res: any[]) => {
      this.data = res
      this.DynamicData = this.filterDate(this.data, "01/01/2021", "01/10/2022")
      this.DynamicData = this.reduceData(this.DynamicData);
      this.svg = d3.select("#bar")
        .append("svg")
        .attr("width", this.width + (50 * 4))
        .attr("height", this.height + (50 * 4))
        .append("g")
        .attr("transform", "translate(" + 50 + "," + 50 + ")");
      this.drawBars(this.DynamicData)
    })
    this.form.controls.end.valueChanges.subscribe(() => {
      this.changed()
    });

    this.form.controls.person.valueChanges.subscribe(() => {
      this.changeData()
    });

  }

  ngOnChanges() {
        
    this.changeData();    
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

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((optionValue: any) => optionValue.toLowerCase().includes(filterValue));
  }


  changed() {
    if (this.form.controls.end.value != null) {
    let start = this.getDate(this.form.controls.start.value);
    let end = this.getDate(this.form.controls.end.value);
      this.DynamicData = this.data
      this.DynamicData = this.filterDate(this.DynamicData, start, end)
      this.DynamicData = this.reduceData(this.DynamicData);
      this.drawBars(this.DynamicData)
    } else if(this.form.controls.end.value == null && this.form.controls.start.value == null) {
      this.DynamicData = this.data
      this.DynamicData = this.filterDate(this.DynamicData, "01/01/2021", "01/10/2022")
      this.DynamicData = this.reduceData(this.DynamicData);
      this.drawBars(this.DynamicData)
    }
  }

  getDate(date: Date) {
    if (date == null)
      return null;
    console.log(date)
    let fixNumber = (n: number) => (n > 9 ? n + "" : "0" + n);
    return `${fixNumber(date.getMonth() + 1)}/${fixNumber(date.getDate())}/${date.getFullYear()}`;
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

  drawBars(data: any[]) {
    let yScale = d3.scaleLinear()
    if (data.length != 0) {
      this.svg.selectAll("g").remove()
      this.x.range([0, this.width])
        .domain(data.map(d => d[0]))
        .padding(0.2);

      this.y.domain([data[0][1], 0])
        .range([0, this.height]);

      yScale.domain([0, data[0][1]])
        .range([0, this.height]);
    }
    // Draw the X-axis on the DOM
    if (data.length != 0)
      this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("color", "white");

    // Draw the Y-axis on the DOM
    if (data.length != 0)
      this.svg.append("g")
      .call(d3.axisLeft(this.y))
      .style("color", "white");

    const tootltip = d3.select(".tootltipEmp").append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      


    // Create and fill the bars
    let bars = this.svg.selectAll(".bar")
      .data(data, (d: any) => {
        return d[0]
      })

    bars.exit()
      .remove();


    bars.enter()
      .append("rect")
      .attr('class', "bar")
      .attr("x", (d: any) => {
        return this.x(d[0])
      })
      .attr("width", this.x.bandwidth())
      .attr("fill", "#ecd582")
      .attr('y', (d: any) => {
        return this.height
      })
      .attr('height', (d: any) => {
        return 0
      })
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
      .transition()
      .duration(600)
      .ease(d3.easeLinear)
      .attr('y', (d: any) => {
        return this.height - yScale(d[1])
      })
      .attr('height', (d: any) => {
        return yScale(d[1])
      })


    bars.transition()
      .duration(600)
      .ease(d3.easeLinear)
      .attr("x", (d: any) => {
        return this.x(d[0])
      })
      .attr('y', (d: any) => {
        return this.height - yScale(d[1])
      })
      .attr('height', (d: any) => {
        return yScale(d[1])
      })



  }

  filterDate(data: any, start: any, end: any) {
    start = new Date(start);
    end = new Date(end);
    let filterByData = data.filter((d: any) => {
      return (start <= new Date(d.date) && new Date(d.date) <= end)
    });
    return filterByData;
  }


  dynamicSort(property: any) {
    let sortOrder = -1;
    if (property[0] === "-") {
      sortOrder = 1;
      property = property.substr(1);
    }
    return function (a: any, b: any) {
      let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }

}
