import { Component, OnInit } from '@angular/core';
import { PieChartService } from './../../services/pie-chart.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-graph-chart',
  templateUrl: './graph-chart.component.html',
  styleUrls: ['./graph-chart.component.scss']
})
export class GraphChartComponent {

  graph: any;
  svg: any;
  draggedNode : any ; 
  simulation : any ; 
  link : any ;
  node : any ; 
  private color: any;
  private width = 600 ; 
  private height = 200 ; 


  constructor(private graphChart: PieChartService) { 

    this.graphChart.get_graph().then((res: any) => {

      this.graph = res ;
      this.svg = d3.select("figure#graph")
                    .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .append("g")
                    // .attr(
                    //   "transform",
                    //   "translate(" + this.width / 2 + "," + this.height / 2 + ")"
                    // );

      this.color = d3.scaleOrdinal(d3.schemeCategory10);
      this.drawGraph(this.graph)

      // this.color = this.getRandomColor(6)
      // console.log(this.color);

      // for (let i = 0; i < 3; i++) { 
      //   console.log(this.colors[i]);
      // }
      
      // console.log(this.getUnique(this.graph.nodes));
      var legendAux = ['Education', 'Coding', 'SocialMedia', 'Search', 'Other', 'Entertainment']  
      // var legendAux = []  
  
      this.svg.append('g')
              .selectAll("circle")
              .data(legendAux)
              .enter()
              .append("circle")
              .attr("cx", 5)
              .attr("cy",(d: any) => { return ((legendAux.indexOf(d) + 1)*20) +30; })
              .attr("r", 5)
              .style("fill", (d: any) => { return this.color(legendAux.indexOf(d) + 1); })

      this.svg.append('g')
              .selectAll("circle")
              .data(legendAux)
              .enter()
              .append("text")
              .attr("x", 15)
              .attr("y", (d: any) => { return ((legendAux.indexOf(d) + 1)*20) +30; })
              .text((d: any) => (d))
              .style("font-size", "15px")
              .attr("alignment-baseline","middle")

      // console.log(this.graph.nodes);
      // console.log(this.randomData())

      // d3.select(".check")
      //         .on("click", () =>{
      //           // console.log('Wesh');
      //           this.drawGraph(this.randomData())  ; 
      //   }); 
    })

  }

  getUnique(graphNodes: any){
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

  getRandomColor(numberColors : any) {
    var a = []
    var letters = '0123456789ABCDEF';
    
    for(var j=0 ; j< numberColors ; j++){
      var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
    a.push(color)
  }
    return a;
  }

  randomData (){
    var data : any ; 
    this.graphChart.get_graph().then((res: any) => {
      this.graph = res ; 
    })
    return this.graph
    
    // return data 
  } 

   drawGraph(graph : any){
            this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d: any) { return d.id; }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));
      // console.log(graph);
      
        this.link = this.svg.append("g")
        // .attr("class", "links")
        .attr("stroke", "#000")
        // .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function(d: any) { return (d.value/10); })
        // .attr("stroke-width", function(d: any) { return Math.sqrt(d.value); });

        
        this.node =  this.svg.append("g")
        // .attr("class", "nodes")
        .attr("stroke", "#fff")
        .attr("stroke-opacity", "1.5px")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", (d: any) => { return Math.log(d.Count) + 2  ; })
        .attr("fill", (d: any) => { return this.color(d.group); })
        .call(d3.drag()
        .on("start", (d: any) => {
                  this.simulation.alphaTarget(0.3).restart();
                  d.fx = d.x;
                  d.fy = d.y;
                  // this.draggedNode = d;
        })
        .on("drag", (event, d: any) => {
          d.fx = d3.pointer(event)[0] - 3*(this.width/5)
          d.fy = d3.pointer(event)[1] - 130
          this.simulation.alphaTarget(0.3).restart();
          
        })
        .on("end", (d) => {
          this.simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
          // this.draggedNode = null;
        }))
        // .on('mouseover', (d: any) => {
        //       console.log(this.node);
              
        //       d3.select("circle").transition()
        //       .duration(750)
        //       .attr("r", 16);
        // })
        // .on('mouseout', () => {
        //   d3.select("circle").transition()
        //   .duration(750)
        //   .attr("r", 8);
        // })
        
        

        this.node.append("title")
        .text(function(d: any) { return d.id; });

        this.simulation
        .nodes(graph.nodes)
        .on("tick", () => {
          this.link
              .attr("x1", function(d: any) { return d.source.x; })
              .attr("y1", function(d: any) { return d.source.y; })
              .attr("x2", function(d: any) { return d.target.x; })
              .attr("y2", function(d: any) { return d.target.y; });
      
          this.node
              .attr("cx", function(d: any) { return d.x; })
              .attr("cy", function(d: any) { return d.y; });
        });

        this.simulation.force("link")
        .links(graph.links);
   }

  //  ticked() 

//  dragstarted(d: any) {
//   // if (!d3.event.active) 
//   this.simulation.alphaTarget(0.3).restart();
//   d.fx = d.x;
//   d.fy = d.y;
// }

//  dragged(d: any) {
//   // d.fx = d3.event.x;
//   // d.fy = d3.event.y;
// }

//  dragended(d: any) {
//   // if (!d3.event.active) 
//   this.simulation.alphaTarget(0);
//   d.fx = null;
//   d.fy = null;
// }

}
