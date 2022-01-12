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
  selector: 'app-graph-chart',
  templateUrl: './graph-chart.component.html',
  styleUrls: ['./graph-chart.component.scss']
})
export class GraphChartComponent {

  graph: any;
  svg: any;
  draggedNode: any;
  simulation: any;
  link: any;
  node: any;
  private color: any;
  private width = 960;
  private height = 900;
  
  nodes : any; 
  links : any; 
  form: FormGroup;
  options: any = ["Adnane DR","Khalid CH",  "Khalid OUH"];
  filteredOptions: Observable < string[] > ;
  data: any;

  @Input() item:number = 0;

  ngOnChanges() {
        
    this.changeData();    
}

  constructor(private dataService: DataService,
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

    this.dataService.getRealHistory().then((res: any) => {
      this.data = res
      this.nodes = this.filterDate(this.data, "01/01/2022", "01/10/2022")
      this.nodes = this.reduceData(this.nodes);

      this.links = this.filterDate(this.data, "01/01/2022", "01/10/2022")
      this.links = this.basculeData(this.links);
      this.graph = this.combineData(this.nodes,this.links)
      
      // this.graph = res;
      this.svg = d3.select("figure#graph")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)


      this.color = d3.scaleOrdinal(d3.schemeCategory10);

      this.form.controls.end.valueChanges.subscribe(() => {
        this.changed()
      });

      this.form.controls.person.valueChanges.subscribe(() => {
        this.changeData()
      
      });
      

      this.drawGraph(this.graph);
    })

  }


  cleanSVG() {
    d3.selectAll('image').remove()
    d3.selectAll('circle').remove();
    d3.selectAll('line').remove();
  }


  basculeData(data: any[]) {
    console.log(data)
    let counts = data.reduce((p: any[], c: any, index: any) => {
      let name = c.website
      let order = Number(c.order)
      let nextOrder = Number(c.order) + 1

      if (c.transition == "link" && index != 0) {
        if (c.website !== data[index - 1].website)
          p.push({
            "target": c.website,
            "source": data[data.indexOf(c) - 1].website,
            "value": 0
          });
          // p.push([c.website, data[data.indexOf(c) - 1].website, 0 ]);
      }
      return p
    }, [])

    counts = counts.reduce((p: any, c: any, index: any) => {
      let key = c.source + c.target;
      let inverseKey = c.target + c.source;

      // let key = c[1] + c[0] ;
      // let inverseKey = c[0] + c[1] ;
      
      if (!p.hasOwnProperty(key) && !p.hasOwnProperty(inverseKey)) {
        p[key] = c
      } else if (p.hasOwnProperty(key)) {
        let tmp = p[key]
        tmp.value
        p[key] = tmp
      } else if (p.hasOwnProperty(inverseKey)) {
        let tmp = p[inverseKey]
        tmp.value++
        p[inverseKey] = tmp
      }
      return p
    }, {})

    let sortable = [];
    for (let entry in counts) {
      sortable.push(counts[entry]);
    }
    // console.log(counts);

    // sortable.sort(function (a, b) {
    //   return b[1] - a[1];
    // });
    // return sortable.slice(0, 6)
    return sortable

  }

  combineData(nodes:any,links:any){
    return {"nodes":nodes,"links":links}
  }

  determineImage(website:string){
    let parts  = website.split(".")
    switch (parts[0]) {
      case 'docs':
        return "./../../assets/logos/"+parts[0]+".png";
        break;
        case 'mail':
          return "./../../assets/logos/gmail.png";
          break;
      case 'drive':
        return "./../../assets/logos/"+parts[0]+".png";
      case 'github':
        return "./../../assets/logos/"+parts[0]+".png";
        break;
      case 'stackoverflow':
          return "./../../assets/logos/stackOverflow.png";
          break;
      case 'translate':
          return "./../../assets/logos/translate.png";
          break;
      case 'localhost':
          return "./../../assets/logos/localhost.png";
          break;
      case 'localhost:4200':
          return "./../../assets/logos/localhost.png";
          break;
      case 'cpanel-box5703':
          return "./../../assets/logos/cpanel.png";
          break;
    }

    if(parts[0] == "www" && parts.length === 3){
      return "./../../assets/logos/"+parts[1]+".png"
    }

    return "./../../assets/logos/airbnb.png"


    
  }
  


  reduceData(data: any) {
    let counts = data.reduce((p: any, c: any) => {
      let name = c.website;
      let image = this.determineImage(name)
      if (!p.hasOwnProperty(name)) {
        p[name] = [0,image];
      }
      p[name][0]++;
      return p;
    }, {});

    let sortable = [];
    for (let entry in counts) {
      sortable.push({"id":entry, "Count":counts[entry][0],"image":counts[entry][1]});
    }
    return sortable
  }


  // randomData() {
  //   var data: any;
  //   this.graphChart.get_graph().then((res: any) => {
  //     this.graph = res;
  //   })
  //   return this.graph
  //   // return data 
  // }

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
    this.nodes = this.filterDate(this.data, start, end)
    this.nodes = this.reduceData(this.nodes);

    this.links = this.filterDate(this.data, start, end)
    this.links = this.basculeData(this.links);
    this.graph = this.combineData(this.nodes,this.links)
    
    console.log("Im here")
      
      this.drawGraph(this.graph)
    } else if(this.form.controls.end.value == null && this.form.controls.start.value == null) {
      
      this.nodes = this.filterDate(this.data, "01/01/2022", "01/10/2022")
      this.nodes = this.reduceData(this.nodes);

      this.links = this.filterDate(this.data, "01/01/2022", "01/10/2022")
      this.links = this.basculeData(this.links);
      this.graph = this.combineData(this.nodes,this.links)
      // this.DynamicData = this.filterDate(this.DynamicData, "01/01/2021", "01/10/2022")
      // this.DynamicData = this.reduceData(this.DynamicData);
      this.drawGraph(this.graph)
    }
  }

  getDate(date: Date) {
    if (date == null)
      return null;
    // console.log(date)
    let fixNumber = (n: number) => (n > 9 ? n + "" : "0" + n);
    return `${fixNumber(date.getMonth() + 1)}/${fixNumber(date.getDate())}/${date.getFullYear()}`;
  }

  filterDate(data: any, start: any, end: any) {
    start = new Date(start);
    end = new Date(end);
    let filterByData = data.filter((d: any) => {
      return (start <= new Date(d.date) && new Date(d.date) <= end)
    });
    return filterByData;
  }

  // drawGraph(nodes: any, links : any) {

  //   const tooltip = d3.select("#graph")
  //     .append("div")
  //     .attr("class", "d3-tooltip")
  //     .style("position", "absolute")
  //     .style("z-index", "100")
  //     .style("visibility", "hidden")
  //     .style("padding", "6px")
  //     .style("background", "rgba(0,0,0,0.6)")
  //     .style("border-radius", "5px")
  //     .style("color", "#fff")
  //     .text("a simple tooltip");


  //     // console.log(test(links));
  //     // console.log(links);
      
      
  //   this.simulation = d3.forceSimulation()
  //     .force("link", d3.forceLink().distance(d => 150).id( (d: any) => {
  //       return d;
  //     }))
  //     .force("charge", d3.forceManyBody())
  //     .force("center", d3.forceCenter(this.width / 2, this.height / 2));
  //   // console.log(graph);

  //   var link = this.svg.append("g")
  //     .attr("class", "links")
  //     .attr("stroke", "#d8d8d8")
  //     .attr("stroke-opacity", 0.6)
  //     .selectAll("line")
  //     .data(links)
  //     .enter().append("line")
  //     .attr("stroke-width", (d: any) =>{
  //       // console.log(d);
        
  //       return (d.value);
  //     })
  //   var node = this.svg.append("g")
  //     .attr("class", "nodes")
  //     .attr("stroke", "#fff")
  //     .attr("stroke-opacity", "1.5px")
  //     .selectAll("g")
  //     .data(nodes)
  //     .enter().append("g").call(d3.drag()
  //       .on("start", (d: any) => {
  //         console.log(d);

  //         this.simulation.alphaTarget(0.3).restart();
  //         d.fx = d.x;
  //         d.fy = d.y;
  //         this.draggedNode = d;
  //       })
  //       .on("drag", (event, d: any) => {
  //         d.fx = event.x
  //         d.fy = event.y

  //       })
  //       .on("end", (event: any, d: any) => {
  //         if (!event.currentTarget) this.simulation.alphaTarget(0);
  //         d.fx = null;
  //         d.fy = null;
  //         this.draggedNode = null;
  //       }))

  //     .on('mouseover', (event: any, d: any) => {

  //       if (this.draggedNode != null) {
  //         // console.log(this.draggedNode);
  //         d = this.draggedNode;
  //       }

  //       link.attr("stroke", "#000")
  //       const to_keep = new Set();

  //       link
  //         .filter(function (c: any) {
  //           // console.log(c);

  //           const f = c.source.id != d.id && c.target.id != d.id && c.value > 0;

  //           if (!f && c.value > 0)
  //             to_keep.add(c.source.id == d.id ? c.target.id : c.source.id);
  //           return f;
  //         })
  //         .style('opacity', 0.1);


  //       //   // Set opacity of nodes to remove
  //       node
  //         .filter(function (c: any) {
  //           return !to_keep.has(c.id) && c.id != d.id
  //         })
  //         .style('opacity', 0.1);

  //       tooltip.html(`${d[0]}`).style("visibility", "visible");
  //       d3.select(event.currentTarget)
  //       // .transition()
  //       // .duration(50)
  //     })
  //     .on("mousemove", (event: any, d: any) => {
  //       tooltip
  //         .style("top", (event.pageY - 10) + "px")
  //         .style("left", (event.pageX + 10) + "px");
  //     })
  //     .on('mouseout', (event: any, d: any) => {

  //       link.style('opacity', 1).attr("stroke", "#d8d8d8");
  //       node.style('opacity', 1);
  //       tooltip.style('visibility', 'hidden')
  //     })

  //   // console.log(nodes);
    
  //   const circles = node.append("circle")
  //     .attr("r", (d: any) => {
  //       return Math.sqrt(d[1] / Math.PI) + 3;
  //     })
  //     .attr("fill", "#fff")
  //     .attr('stroke', 'black');

  //   // Images within the circles
  //   // const images = node.append('image')
  //   //   .attr('xlink:href', (d: any) => {
  //   //     // console.log(d.image);

  //   //     return String(d.image)
  //   //   })
  //   //   .attr('width', (d: any) => {
  //   //     return 2 * Math.sqrt(d.Count / Math.PI);
  //   //   })
  //   //   .attr('height', (d: any) => {
  //   //     return 2 * Math.sqrt(d.Count / Math.PI);
  //   //   })
  //   //   .attr('x', (d: any) => {
  //   //     return -Math.sqrt(d.Count / Math.PI);
  //   //   })
  //   //   .attr('y', (d: any) => {
  //   //     return -Math.sqrt(d.Count / Math.PI);
  //   //   });


  //   this.simulation
  //     .nodes(nodes)
  //     .on("tick", () => {
  //       link
  //         .attr("x1", function (d: any) {
  //           return d.source.x;
  //         })
  //         .attr("y1", function (d: any) {
  //           return d.source.y;
  //         })
  //         .attr("x2", function (d: any) {
  //           return d.target.x;
  //         })
  //         .attr("y2", function (d: any) {
  //           return d.target.y;
  //         });

  //       node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
  //     });

  //   this.simulation.force("link")
  //     .links(links);

  // }

  drawGraph(graph: any) {
  
  this.svg.selectAll("*").remove()
  const tooltip = d3.select("#graph")
    .append("div")
    .attr("class", "d3-tooltip")
    .style("position", "absolute")
    .style("z-index", "100")
    .style("visibility", "hidden")
    .style("padding", "6px")
    .style("background", "rgba(0,0,0,0.6)")
    .style("border-radius", "5px")
    .style("color", "#fff")
    .text("a simple tooltip");

    console.log(graph);
    
  this.simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(d => 100).id(function (d: any) {
      return d.id;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(this.width / 2, this.height / 2));
  // console.log(graph);

  var link = this.svg.append("g")
    .attr("class", "links")
    .attr("stroke", "#d8d8d8")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function (d: any) {
      return (Math.sqrt(d.value));
    })
  var node = this.svg.append("g")
    .attr("class", "nodes")
    .attr("stroke", "#fff")
    .attr("stroke-opacity", "1.5px")
    .selectAll("g")
    .data(graph.nodes)
    .enter().append("g").call(d3.drag()
      .on("start", (d: any) => {
        // console.log(d);

        this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        this.draggedNode = d;
      })
      .on("drag", (event, d: any) => {
        d.fx = event.x
        d.fy = event.y

      })
      .on("end", (event: any, d: any) => {
        if (!event.currentTarget) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        this.draggedNode = null;
      }))

    .on('mouseover', (event: any, d: any) => {

      if (this.draggedNode != null) {
        // console.log(this.draggedNode);
        d = this.draggedNode;
      }

      link.attr("stroke", "#fff")
      const to_keep = new Set();

      link
        .filter(function (c: any) {
          // console.log(c.id);

          const f = c.source.id != d.id && c.target.id != d.id && c.value > 0;

          if (!f && c.value > 0)
            to_keep.add(c.source.id == d.id ? c.target.id : c.source.id);
          return f;
        })
        .style('opacity', 0.1);


      //   // Set opacity of nodes to remove
      node
        .filter(function (c: any) {
          return !to_keep.has(c.id) && c.id != d.id
        })
        .style('opacity', 0.1);

      tooltip.html(`${d.id}`).style("visibility", "visible");
      d3.select(event.currentTarget)
      // .transition()
      // .duration(50)
    })
    .on("mousemove", (event: any, d: any) => {
      tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on('mouseout', (event: any, d: any) => {

      link.style('opacity', 1).attr("stroke", "#d8d8d8");
      node.style('opacity', 1);
      tooltip.style('visibility', 'hidden')
    })


  const circles = node.append("circle")
    .attr("r", (d: any) => {
      return Math.sqrt(d.Count ) + 3;
    })
    .attr("fill", "#fff")
    .attr('stroke', 'black');

  // Images within the circles
  const images = node.append('image')
    .attr('xlink:href', (d: any) => {
      // console.log(d.image);

      return String(d.image)
    })
    .attr('width', (d: any) => {
      return 2 * Math.sqrt(d.Count / Math.PI);
    })
    .attr('height', (d: any) => {
      return 2 * Math.sqrt(d.Count / Math.PI);
    })
    .attr('x', (d: any) => {
      return -Math.sqrt(d.Count / Math.PI);
    })
    .attr('y', (d: any) => {
      return -Math.sqrt(d.Count / Math.PI);
    });


  this.simulation
    .nodes(graph.nodes)
    .on("tick", () => {
      link
        .attr("x1", function (d: any) {
          return d.source.x;
        })
        .attr("y1", function (d: any) {
          return d.source.y;
        })
        .attr("x2", function (d: any) {
          return d.target.x;
        })
        .attr("y2", function (d: any) {
          return d.target.y;
        });

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

  this.simulation.force("link")
    .links(graph.links);

}


}


// drawGraph(graph: any) {

//   const tooltip = d3.select("#graph")
//     .append("div")
//     .attr("class", "d3-tooltip")
//     .style("position", "absolute")
//     .style("z-index", "100")
//     .style("visibility", "hidden")
//     .style("padding", "6px")
//     .style("background", "rgba(0,0,0,0.6)")
//     .style("border-radius", "5px")
//     .style("color", "#fff")
//     .text("a simple tooltip");

//     console.log(graph);
    
//   this.simulation = d3.forceSimulation()
//     .force("link", d3.forceLink().distance(d => 150).id(function (d: any) {
//       return d.id;
//     }))
//     .force("charge", d3.forceManyBody())
//     .force("center", d3.forceCenter(this.width / 2, this.height / 2));
//   // console.log(graph);

//   var link = this.svg.append("g")
//     // .attr("class", "links")
//     .attr("stroke", "#d8d8d8")
//     .attr("stroke-opacity", 0.6)
//     .selectAll("line")
//     .data(graph.links)
//     .enter().append("line")
//     .attr("stroke-width", function (d: any) {
//       return (d.value);
//     })
//   var node = this.svg.append("g")
//     .attr("class", "nodes")
//     .attr("stroke", "#fff")
//     .attr("stroke-opacity", "1.5px")
//     .selectAll("g")
//     .data(graph.nodes)
//     .enter().append("g").call(d3.drag()
//       .on("start", (d: any) => {
//         // console.log(d);

//         this.simulation.alphaTarget(0.3).restart();
//         d.fx = d.x;
//         d.fy = d.y;
//         this.draggedNode = d;
//       })
//       .on("drag", (event, d: any) => {
//         d.fx = event.x
//         d.fy = event.y

//       })
//       .on("end", (event: any, d: any) => {
//         if (!event.currentTarget) this.simulation.alphaTarget(0);
//         d.fx = null;
//         d.fy = null;
//         this.draggedNode = null;
//       }))

//     .on('mouseover', (event: any, d: any) => {

//       if (this.draggedNode != null) {
//         // console.log(this.draggedNode);
//         d = this.draggedNode;
//       }

//       link.attr("stroke", "#000")
//       const to_keep = new Set();

//       link
//         .filter(function (c: any) {
//           // console.log(c.id);

//           const f = c.source.id != d.id && c.target.id != d.id && c.value > 0;

//           if (!f && c.value > 0)
//             to_keep.add(c.source.id == d.id ? c.target.id : c.source.id);
//           return f;
//         })
//         .style('opacity', 0.1);


//       //   // Set opacity of nodes to remove
//       node
//         .filter(function (c: any) {
//           return !to_keep.has(c.id) && c.id != d.id
//         })
//         .style('opacity', 0.1);

//       tooltip.html(`${d.id}`).style("visibility", "visible");
//       d3.select(event.currentTarget)
//       // .transition()
//       // .duration(50)
//     })
//     .on("mousemove", (event: any, d: any) => {
//       tooltip
//         .style("top", (event.pageY - 10) + "px")
//         .style("left", (event.pageX + 10) + "px");
//     })
//     .on('mouseout', (event: any, d: any) => {

//       link.style('opacity', 1).attr("stroke", "#d8d8d8");
//       node.style('opacity', 1);
//       tooltip.style('visibility', 'hidden')
//     })


//   const circles = node.append("circle")
//     .attr("r", (d: any) => {
//       return Math.sqrt(d.Count / Math.PI) + 3;
//     })
//     .attr("fill", "#fff")
//     .attr('stroke', 'black');

//   // Images within the circles
//   const images = node.append('image')
//     .attr('xlink:href', (d: any) => {
//       // console.log(d.image);

//       return String(d.image)
//     })
//     .attr('width', (d: any) => {
//       return 2 * Math.sqrt(d.Count / Math.PI);
//     })
//     .attr('height', (d: any) => {
//       return 2 * Math.sqrt(d.Count / Math.PI);
//     })
//     .attr('x', (d: any) => {
//       return -Math.sqrt(d.Count / Math.PI);
//     })
//     .attr('y', (d: any) => {
//       return -Math.sqrt(d.Count / Math.PI);
//     });


//   this.simulation
//     .nodes(graph.nodes)
//     .on("tick", () => {
//       link
//         .attr("x1", function (d: any) {
//           return d.source.x;
//         })
//         .attr("y1", function (d: any) {
//           return d.source.y;
//         })
//         .attr("x2", function (d: any) {
//           return d.target.x;
//         })
//         .attr("y2", function (d: any) {
//           return d.target.y;
//         });

//       node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
//     });

//   this.simulation.force("link")
//     .links(graph.links);

// }
