import {
  Component,
  Injectable,
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
  options: any = ["Khalid CH", "Adnane DR", "Khalid OUH"];
  hours: string[];

  max:Date = new Date("01/10/2022")
  
  rangeFilter: DateFilterFn<Date> = (date: Date | null) => {
    return date?.getDay() ? date?.getDay() === 3 && date < this.max :false;
  };
  
  constructor(private dataService: DataService,
    private ouhmaidData: OuhmaidService,
    private adnaneData: PieChartService,
    private builder: FormBuilder) {
      this.form = builder.group({
        start: builder.control(null),
        end: builder.control(null),
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
    if (this.form.controls.person.value == "Khalid CH") {
      this.dataService.getRealHistory().then((res: any[]) => {
        this.data = res
        this.changed()
      })
    } else if(this.form.controls.person.value == "Adnane DR"){
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
    console.log(date)
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

  //   fixDate(date:string){
  //     let parts = date.split("/")
  //     let toReturn = ""
  //     toReturn += Number(parts[0]) < 10 &&  parts[0].length == 1 ? "0"+parts[0]+"/" : parts[0]+"/";
  //     toReturn += Number(parts[1]) < 10 &&  parts[0].length == 1 ? "0"+parts[1]+"/" : parts[1]+"/";
  //     toReturn += parts[2]
  //     return toReturn
  //   }

  //   dateCompare(d1:string, d2:string){
  //     let date1:any = this.fixDate(d1)
  //     let date2:any = this.fixDate(d2)
  //     date1 = new Date(d1);
  //     date2 = new Date(d2);

  //     console.log(date1,date2)
  //     console.log(date1 < date2)

  //     if(date1 > date2){
  //         return true
  //     } else if(date1 < date2){
  //         return false
  //     } else{
  //         return false
  //     }
  // }


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
    console.log(data)
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

    let xScale = d3.scaleBand().range([0, this.width]).domain(myGroups).padding(0.1);

    this.svg.append("g")
      .style("font-size", 15)
      .attr("transform", "translate(0," + (this.height + 10) + ")")
      .call(d3.axisBottom(xScale).tickSize(0))
      .select(".domain").remove()


    let yScale = d3.scaleBand()
      .range([this.height, 0])
      .domain(myVars)
      .padding(0.05);

    this.svg.append("g")
      .style("font-size", 15)
      .call(d3.axisLeft(yScale).tickSize(0))
      .select(".domain").remove()

    let myColor = d3.scaleSequential()
      .interpolator(d3.interpolateBlues)
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
    console.log(data)
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


    this.svg.append("text")
      .attr("x", 0)
      .attr("y", -50)
      .attr("text-anchor", "left")
      .style("font-size", "22px")
      .text("Quand est-ce que j'utilise le plus mon PC ?");

    // Add subtitle to graph
    this.svg.append("text")
      .attr("x", 0)
      .attr("y", -20)
      .attr("text-anchor", "left")
      .style("font-size", "14px")
      .style("fill", "grey")
      .style("max-width", 400)
      .text("Ce graphique représente le nombre horaire de sites visités en corrélation de jours");

  }

  compareDecimals(a: any, b: any) {
    if (a === b)
      return 0;

    return a < b ? -1 : 1;
  }




  ngOnInit(): void {}

}
