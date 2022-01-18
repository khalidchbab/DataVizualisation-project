import {
  Component,
  Injectable,
  Input,
  OnInit
} from '@angular/core';
import {
  DataService
} from './../../services/data.service';
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
import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  DateFilterFn,
} from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';



@Injectable()
export class FiveDayRangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D | null): DateRange<D> {
    return this._createSevenDayRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this._createSevenDayRange(activeDate);
  }

  private _createSevenDayRange(date: D | null): DateRange<D> {
    if (date) {
      const start = this._dateAdapter.addCalendarDays(date, -3);
      const end = this._dateAdapter.addCalendarDays(date, 3);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}

@Component({
  selector: 'app-day-chart',
  templateUrl: './day-chart.component.html',
  styleUrls: ['./day-chart.component.scss'],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class DayChartComponent implements OnInit {

  form: FormGroup
  data: any;
  svg: any;
  private margin = 50;
  private width = 600;
  private height = 600;
  DynamicData: any;
  x = d3.scaleBand()
  y = d3.scaleLinear()
  options: any = ["Adnane DR","Khalid CH",  "Khalid OUH"];
  hours: string[];

  max:Date = new Date("01/10/2022")
  min:Date = new Date("10/13/2021")
  @Input() item:number = 0;

  ngOnChanges() {
        
    this.changeData();    
}

  
  rangeFilter: DateFilterFn<Date> = (date: Date | null) => {
    return date?.getDay() ? date?.getDay() === 3 && date < this.max && date > this.min :false;
  };
  
  constructor(private dataService: DataService,
    private ouhmaidData: OuhmaidService,
    private adnaneData: PieChartService,
    private builder: FormBuilder) {
      this.form = builder.group({
        start: builder.control(new Date("01/01/2022")),
        end: builder.control(this.max),
        person: builder.control("Khalid CH")
      });
  
    this.hours = this.generateHours()
    this.dataService.getRealHistory().then((res: any) => {
      this.data = res
      this.DynamicData = this.reduceDataByDay(this.data, "01/01/2022", "01/10/2022")
      this.svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", this.width + (50 * 4))
        .attr("height", this.height + (50 * 4))
        .append("g")
        .attr("transform", "translate(" + 100 + "," + 100 + ")");
      this.drawChart(this.DynamicData)
    })

    this.form.controls.end.valueChanges.subscribe(() => {
      this.changed()
    });

    this.form.controls.person.valueChanges.subscribe(() => {
      this.changeData()
    });


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

  


  getDate(date: Date) {
    if (date == null)
      return null;
    let fixNumber = (n: number) => (n > 9 ? n + "" : "0" + n);
    return `${fixNumber(date.getMonth() + 1)}/${fixNumber(date.getDate())}/${date.getFullYear()}`;
  }

  changed() {
    if (this.form.controls.end.value != null) {
    let start = this.getDate(this.form.controls.start.value);
    let end = this.getDate(this.form.controls.end.value);
      this.DynamicData = this.data
      this.DynamicData = this.reduceDataByDay(this.DynamicData,start,end)
      this.drawChart(this.DynamicData)
    } else if(this.form.controls.end.value == null && this.form.controls.start.value == null) {
      this.DynamicData = this.data
      
      this.DynamicData = this.reduceDataByDay(this.DynamicData, "01/01/2022", "01/06/2022")
      this.drawChart(this.DynamicData)
    }
  }

  filterDate(data: any, start: any, end: any) {
    start = new Date(start);
    end = new Date(end);
    let filterByData = data.filter((d: any) => {
      return (start <= new Date(d.date) && new Date(d.date) <= end)
    });
    return filterByData;
  }

  

  reduceDataByDay(data: any, start: any, end: any) {
    let counts = data.reduce((p: any, c: any) => {
      let name = c.date;
      if (!p.hasOwnProperty(name)) {
        p[name] = [];
      }
      p[name].push(c);
      return p;
    }, []);
    counts = this.reduceDataByHour(counts, start, end)
    return counts
  }

  generateHours() {
    let hours = []
    for (let i = 0; i < 24; i++) {
      if (i < 10) {
        hours.push("0" + i + ":00:00")
      } else {
        hours.push(i + ":00:00")
      }
    }
    return hours
  }

  reduceDataByHour(data: any, start: any, end: any) {
    start = new Date(start);
    end = new Date(end);
    data = Object.keys(data).map((key: any) => [key, data[key]]);
    let filterByData = data.filter((d: any) => {
      return (start <= new Date(d[0]) && new Date(d[0]) <= end)
    });
    let filterByDataTMP = []
    for (let fd of filterByData) {
      data = fd[1]
      let counts = data.reduce((p: any, c: any) => {
        let time = c.time;
        let hour = time.split(":")[0]
        if (hour < 10) {
          time = "0" + hour + ":00:00"
        } else {
          time = hour + ":00:00"
        }
        if (!p.hasOwnProperty(time)) {
          p[time] = 0;
        }
        p[time]++;
        return p;
      }, []);
      for (let item of this.hours) {
        if (!counts.hasOwnProperty(item)) {
          counts[item] = 0;
        }
      }
      filterByDataTMP.push([fd[0], counts]);
    }
    return filterByDataTMP
  }


  getDataInRightForm(data: any) {
    let tmp: any[] = []
    for (let d of data) {
      for (let i in d[1]) {
        tmp.push({
          "group": d[0],
          "variable": i,
          "value": d[1][i]
        })
      }
    }
    return tmp
  }

  drawChart(data: any) {
    this.svg.selectAll("*").remove()
    let myGroups = d3.map(data, (d: any) => {
      return d[0];
    })
    myGroups = myGroups.sort(this.compareDecimals)
    
    let myVars = d3.map(Object.keys((data[0][1])), (d: any) => {
      return d;
    })
    myVars.sort(this.compareDecimals)

    let xScale = d3.scaleBand().range([0, this.width]).domain(myGroups).padding(0.2);

    this.svg.append("g")
      .style("font-size", 11)
      .style("color", "white")
      .attr("transform", "translate(0," + (this.height + 10) + ")")
      .call(d3.axisBottom(xScale).tickSize(0))
      .select(".domain").remove()


    let yScale = d3.scaleBand()
      .range([this.height, 0])
      .domain(myVars)
      .padding(0.2);

    this.svg.append("g")
      .style("font-size", 15)
      .style("color", "white")
      .call(d3.axisLeft(yScale).tickSize(0))
      .select(".domain").remove()

    let myColor = d3.scaleSequential()
      .interpolator(d3.interpolateYlOrRd)
      .domain([1, 100])

    let tooltip = d3.select("#heatmap")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")

    let mousemove = (event: any, d: any) => {
      tooltip.transition()
        .duration(100)
        .style('opacity', .9);
      d3.select(event.currentTarget)
        .style("stroke", "none")
        .style("opacity", 0.5)
      tooltip
        .html("Viseted " + d.value + " sites")
        .style("left", (event.pageX + 30) + "px")
        .style("top", (event.pageY + 50) + "px")
    }

    const mouseleave = (event: any, d: any) => {
      tooltip.transition()
          .duration(100)
          .style('opacity', 0);
      d3.select(event.currentTarget)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }

    data = this.getDataInRightForm(data)
    this.svg.selectAll()
      .data(data, function (d: any) {
        return d.group + ':' + d.variable;
      })
      .join("rect")
      .attr("x", function (d: any) {
        return xScale(d.group)
      })
      .attr("y", function (d: any) {
        return yScale(d.variable)
      })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .style("fill", function (d: any) {
        return myColor(d.value)
      })
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
      .on("mousemove", mousemove)
      .on("mouseout", mouseleave)


    // Add subtitle to graph
    this.svg.append("text")
      .attr("x", 0)
      .attr("y", -20)
      .attr("text-anchor", "left")
      .style("font-size", "14px")
      .style("fill", "white")
      .style("max-width", 400)
      .text("This graph shows us the correleation between time of the day and intensity of activities of the user");

    ///////////////////////////////// Adding legends  //////////////////////////////// 

    let  days = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"],
    times = d3.range(24),
    gridSize = Math.floor(this.width / times.length) ; 
    // heightSize = gridSize * days.length ; 

    let maxData : any ;
    maxData = d3.max(data, (d: any) => {
      return d.value;
    })
        
    var colorScale = d3.scaleLinear<string>()
    .domain([0, maxData/2 , maxData])
    // .range(color);
    .range(["#ffffcc", "#cd5332", "#800026"])

    var countScale = d3.scaleLinear()
    .domain([0, maxData])
    .range([0, this.width]),
    numStops = 3, 
    countPoint = [0, maxData/2 , maxData];

    this.svg.append("defs")
    .append("linearGradient")
    .attr("id", "legend-traffic")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%")
    .selectAll("stop") 
    .data(d3.range(numStops))                
    .enter().append("stop") 
        .attr("offset", (d: any,i: any) => { 
            return countScale(countPoint[i]) / this.width;
        })   
        .attr("stop-color", (d: any,i : any) =>{ 
            // return myColor(i) ; 
            return colorScale(countPoint[i]); 
        });

        var legendWidth = Math.min(this.width * 0.8, 400);
        
        var legendsvg = this.svg.append("g") // groupe principal
            .attr("class", "legendWrapper")
            .attr("transform", "translate(" + (this.width/2) + "," + (this.height + 60) + ")");

            legendsvg.append("rect") // rectangle avec gradient
            .attr("class", "legendRect")
            .attr("x", -legendWidth/2)
            .attr("y", 0)
            .attr("width", legendWidth)
            .attr("height", 10)
            .style("fill", "url(#legend-traffic)");

            legendsvg.append("text") // légende
            .attr("class", "legendTitle")
            .attr("x", 0)
            .attr("y", -10)
            .style('fill', 'white')
            .style("text-anchor", "middle")
            .text("Number of visits");

            var xLegendScale = d3.scaleLinear() // scale pour x-axis
          .range([-legendWidth / 2, legendWidth / 2])
          .domain([ 0, maxData] );

      legendsvg.append("g") // x axis
          .attr("class", "axis")
          .attr("x", 0)
          .attr("y", 0)
          .style('color', '#fff')
          .attr("transform", "translate(0," + (10) + ")")
          .call(d3.axisBottom(xLegendScale).ticks(5));

  }

  compareDecimals(a: any, b: any) {
    if (a === b)
      return 0;

    return a < b ? -1 : 1;
  }




  ngOnInit(): void {}

}
