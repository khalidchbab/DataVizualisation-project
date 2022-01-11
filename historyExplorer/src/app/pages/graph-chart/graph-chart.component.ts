import {
  Component,
  OnInit
} from '@angular/core';
import {
  PieChartService
} from './../../services/pie-chart.service';
import * as d3 from 'd3';

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
  private height = 600;


  constructor(private graphChart: PieChartService) {

    this.graphChart.get_graph().then((res: any) => {

      this.graph = res;
      this.svg = d3.select("figure#graph")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);
      // .attr(
      //   "transform",
      //   "translate(" + this.width / 2 + "," + this.height / 2 + ")"
      // );

      this.color = d3.scaleOrdinal(d3.schemeCategory10);
      this.drawGraph(this.graph)
      // this.cleanSVG()

      // this.color = this.getRandomColor(6)
      // console.log(this.color);

      // for (let i = 0; i < 3; i++) { 
      //   console.log(this.colors[i]);
      // }

      // console.log(this.getUnique(this.graph.nodes));
      var legendAux = ['Education', 'Coding', 'SocialMedia', 'Search', 'Other', 'Entertainment']
      // var legendAux = []  

      this.svg.append('g')
        .selectAll('rect')
        // .selectAll("circle")
        .data(legendAux)
        .enter()
        // .append("circle")
        .append("rect")
        // .attr("cx", 5)
        // .attr("cy",(d: any) => { return ((legendAux.indexOf(d) + 1)*20) +30; })
        // .attr("r", 5)
        .attr("x", 0)
        .attr("y", (d: any) => {
          return ((legendAux.indexOf(d) + 1) * 20) + 25;
        })
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", (d: any) => {
          return this.color(legendAux.indexOf(d) + 1);
        })

      this.svg.append('g')
        .selectAll('rect')
        .data(legendAux)
        .enter()
        .append("text")
        .attr("x", 15)
        .attr("y", (d: any) => {
          return ((legendAux.indexOf(d) + 1) * 20) + 30;
        })
        .text((d: any) => (d))
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle")

      var users = ['#user1', '#user2', '#user3']

      users.forEach(el => {
        // d3.select("figure#graph").exit().remove();

        d3.select(el)
          .on("change", () => {
            this.cleanSVG();
            this.drawGraph(this.randomData());
          })
      })

    })

  }


  cleanSVG() {
    d3.selectAll('image').remove()
    d3.selectAll('circle').remove();
    d3.selectAll('line').remove();
  }

  getUnique(graphNodes: any) {
    var lookup: any;
    var items = graphNodes;
    var result = [];
    console.log(graphNodes);

    for (var item, i = 0; item = items[i++];) {
      var name = item.group;

      if (!(name in lookup)) {
        lookup[name] = 1;
        result.push(name);
      }
    }
  }

  getRandomColor(numberColors: any) {
    var a = []
    var letters = '0123456789ABCDEF';

    for (var j = 0; j < numberColors; j++) {
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      a.push(color)
    }
    return a;
  }

  randomData() {
    var data: any;
    this.graphChart.get_graph().then((res: any) => {
      this.graph = res;
    })
    return this.graph
    // return data 
  }

  drawGraph(graph: any) {

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

    this.simulation = d3.forceSimulation()
      .force("link", d3.forceLink().distance(d => 150).id(function (d: any) {
        return d.id;
      }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));
    // console.log(graph);

    var link = this.svg.append("g")
      // .attr("class", "links")
      .attr("stroke", "#d8d8d8")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("stroke-width", function (d: any) {
        return (d.value);
      })
    // .on('mouseover', (event: any, d: any) => {
    //   console.log(d);

    //   tooltip.html(`Interaction: ${d.value}`).style("visibility", "visible");
    //   d3.select(event.currentTarget).transition()
    //     .duration(50)
    //     .attr('opacity', '.75')
    //     // d3.select("circle").transition()
    //     //   .duration(750)
    //     // .attr("r", 16);
    // })
    // .on("mousemove",(event: any, d: any) =>{
    //   tooltip
    //     .style("top", (event.pageY-10)+"px")
    //     .style("left",(event.pageX+10)+"px");
    // })
    // .on("mouseout", (event :any, d:any) =>{
    //   tooltip.style('visibility', 'hidden')
    //   d3.select(event.currentTarget).transition()
    //     .duration(1000)
    // })
    // .attr("stroke-width", function(d: any) { return Math.sqrt(d.value); });

    var node = this.svg.append("g")
      .attr("class","nodes")
      .attr("stroke", "#fff")
      .attr("stroke-opacity", "1.5px")
      .selectAll("g")
      .data(graph.nodes)
      .enter().append("g").call(d3.drag()
      .on("start", (d: any) => {
        console.log(d);
        
        this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        this.draggedNode = d;
      })
      .on("drag", (event, d: any) => {
        d.fx = event.x // - 3 * (this.width / 5)
        d.fy = event.y // - 6 * (this.height / 7)
        // this.simulation.alphaTarget(0.3).restart();

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

      link.attr("stroke", "#000")
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
      // d3.select(event.currentTarget)
      //   .attr("r", Math.log(d.Count) + 2)
      //   .attr('opacity', '1');
      // d3.select("circle").transition()
      //   .duration(750)
      //   .attr("r", 8);
    })
      
      
    const circles = node.append("circle")
      .attr("r", (d: any) => {
        return Math.sqrt(d.Count/ Math.PI) +3;
      })
      // .attr("fill", (d: any) => {
      //   return this.color(d.group);
      // })
      .attr("fill", "#fff")
      .attr('stroke', 'black');

    // Images within the circles
    const images = node.append('image')
    .attr('xlink:href', (d:any) => { 
      console.log(d.image);
      
      return String(d.image)})
    .attr('width', (d: any) => {
      return 2*Math.sqrt(d.Count/ Math.PI);
    })
    .attr('height', (d: any) => {
      return 2*Math.sqrt(d.Count/ Math.PI);
    })
    .attr('x', (d: any) => {
      return -Math.sqrt(d.Count/ Math.PI);
    })
    .attr('y', (d: any) => {
      return -Math.sqrt(d.Count/ Math.PI);
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



        node.attr('transform', (d:any) => `translate(${d.x},${d.y})`);
      });

    this.simulation.force("link")
      .links(graph.links);

    

    // d3.selectAll("line")


  }


}
