import { Component, OnInit } from '@angular/core';
import { PieChartService } from './../../services/pie-chart.service';
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
  
  private _current : any ; 
  // private margin = 50;
  // private width = 750;
  // private height = 600;
  // // The radius of the pie chart is half the smallest side
  // private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors: any;
  ///////////////////////////////////////////////////////
  
  /// Version 3 /////////////////////////////////////////

  private width = 900 ; 
  private height = 600 ; 
  private radius = Math.min(this.width, this.height) / 2;
  // private stroke = innerRadius > 0 ? "none" : "white" ; 
  // private padAngle: any ; 
 
  constructor(private pieChartService:PieChartService) {

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


        
        // this.colors = d3.scaleOrdinal()
        // .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
	      // .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
        
              this.colors = d3.scaleOrdinal()
                      .domain(this.data.map((d:any) => d.Count.toString()))
                      .range(d3.schemePaired);

        console.log(this.data);
        
        // this.randomData() ; 

        // this.change(this.data) ; 
        
        
        this.change(this.data) ;
        // this.run(this.data)
        
        // d3.select("#user1")
        //   // .property('week')
        //   // .selectAll('option')
        //   .on("change", () => {
        //           this.change(this.randomData())  ; 
              
        //   })

        // d3.select("#user2")
        //   // .property('week')
        //   // .selectAll('option')
        //   .on("change", () => {
        //           this.change(this.randomData())  ; 
              
        //   })
        
        d3.select("#time")
          .on("change", () => {
                  this.change(this.randomData())  ; 
              
          })
        
        var users = ['#user1', '#user2', '#user3']

        users.forEach( el => {
          d3.select(el)
          .on("input", () => {
                  this.change(this.randomData())  ; 
              
          })
        })

        
        }) 

        

  }

  //   randomData (){
  //     var labels = this.colors.domain();
  //     return labels.map(function(label: any ){
  //       return { label: label, value: Math.random() }
  //     });
  // }


    randomData (){
    var labels = this.data.map((d:any) => d.Website);
    // console.log(labels);
    
    return labels.map(function(label : any){
      return { Framework: label, Count: Math.random() }
    });
  }


  change(data: any ){

    // console.log('I\'m inside change function  ! ');
    
    
    this.svg.append("g")
    .attr("class", "slices");
    this.svg.append("g")
        .attr("class", "labels");
    this.svg.append("g")
        .attr("class", "lines");

    var pie = d3.pie()
                .sort(null)
                .value(function(d : any) {
                  return d.Count;
                });

    var arc = d3.arc()
                .outerRadius(this.radius * 0.8)
                .innerRadius(this.radius * 0.4);

    var outerArc = d3.arc()
      .innerRadius(this.radius * 0.9)
      .outerRadius(this.radius * 0.9);

    this.svg.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

    // var key = function(d: any){  return d.data.value; };
    // console.log(this.svg);
    
  
    var slice = this.svg.select(".slices").selectAll("path.slice")
		.data(pie(data));
    
    slice.enter()
		.insert("path")
		.style("fill", (d: any) =>  { return this.colors(d.data.Website); }) 
		.attr("class", "slice")
    .on('mouseover', function(this : any, d: any, i : any) {
          // console.log(this);
          // tooltip.html(`Data: ${d.data.Website}`).style("visibility", "visible");
          // d3.select(this)
          //   .append('text')
          // //   .attr("dy", ".35em")
          //   .attr("dy", ".35em")
          //   .text('Weeeeeeeeeeeeeeeeeeeeeeesh');

          d3.select(this).transition()
            .duration(50)
            .attr('opacity', '1')  
          }) 
    .on('mouseout', function (this : any,d: any, i: any) {
          d3.select(this).transition()
            .duration(50)
            .attr('opacity', '.75') 
          }) ; 

	slice		
		.transition().duration(1000)
		.attrTween("d", (d : any) => {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t : any) {
				return arc(interpolate(t));
			};
		})

	slice.exit()
		.remove();

  /* ------- TEXT LABELS -------*/
  
  function midAngle(d : any){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}             
  
	var text = this.svg.select(".labels").selectAll("text")
                    .data(pie(data));

                    text.enter()
                      .append("text")
                      .attr("dy", ".35em")
                      .text(function(d: any) {
                        return d.data.Website;
                                              });
  
                    text.transition().duration(1000)
                      .attrTween("transform", (d: any)=>  {
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return (t: any) => {
                          var d2 = interpolate(t);
                          var pos = outerArc.centroid(d2);
                          pos[0] = this.radius * (midAngle(d2) < Math.PI ? 1 : -1);
                          return "translate("+ pos +")";
                        };
                      })
    .styleTween("text-anchor", (d: any) => {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t: any) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	text.exit()
		.remove();

    /* ------------- Image ------------------- */

  //   var myimage = this.svg.select('.images').selectAll("myimage").data(pie(data)).enter()
  //                         .append('image')
  //                         .attr('xlink:href', (d: any) => { d.image})
  //                         .attr('width', 10)
  //                         .attr('height', 10)

  //   myimage.transition().duration(1000)
	// 	.attrTween("transform", (d: any)=>  {
	// 		this._current = this._current || d;
	// 		var interpolate = d3.interpolate(this._current, d);
	// 		this._current = interpolate(0);
	// 		return (t: any) => {
	// 			var d2 = interpolate(t);
	// 			var pos = outerArc.centroid(d2);
	// 			pos[0] = this.radius * (midAngle(d2) < Math.PI ? 1 : -1);
	// 			return "translate("+ pos +")";
	// 		};
	// 	})
  //   .styleTween("text-anchor", (d: any) => {
	// 		this._current = this._current || d;
	// 		var interpolate = d3.interpolate(this._current, d);
	// 		this._current = interpolate(0);
	// 		return function(t: any) {
	// 			var d2 = interpolate(t);
	// 			return midAngle(d2) < Math.PI ? "start":"end";
	// 		};
	// 	});

	// myimage.exit()
	// 	.remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = this.svg.select(".lines").selectAll("polyline")
                    .data(pie(data));

                  polyline.enter()
                    .append("polyline")

  polyline.attr("stroke", "black")
          .attr("fill", "none")
          .attr("opacity", .3)
          .attr("stroke-width", "2px")

  polyline.transition().duration(1000)
		.attrTween("points", (d: any) =>{
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return (t : any) =>{
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = this.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc.centroid(d2), outerArc.centroid(d2), pos];
			};			
		});
	
	polyline.exit()
		.remove();

    //  d3.select("#time")
    //       // .property('week')
    //       // .selectAll('option')
    //       .on("change", () => {
    //               this.change(this.randomData())  ; 
              
    //       })

  }

  



}

  // Version 2 
//   constructor(private pieChartService:PieChartService) {
//     this.pieChartService.get_test().then((res: any) => {

//       this.data = res

    
//       console.log(this.data.length)
//       this.svg = d3.select("figure#pie")
//           .append("svg")
//           .attr("width", this.width)
//           .attr("height", this.height)
//           .append("g")
//           .attr(
//             "transform",
//             "translate(" + this.width / 2 + "," + this.height / 2 + ")"
//           );
//       this.colors = d3.scaleOrdinal()
//                       .domain(this.data.map((d:any) => d.Stars.toString()))
//                       .range(d3.schemePaired);
      
                      
//       this.change(this.data)  ;
//       d3.select(".change")
//               .on("click", () =>{
//                 // console.log();
//                 this.randomData() ; 
//                 this.change(this.randomData())  ; 
//         });                
//       // this.randomData() ; 
       
//     })

//   }

//   randomData (){
//     var labels = this.data.map((d:any) => d.Framework.toString());
//     // console.log(labels);
    
//     return labels.map(function(label : any){
//       return { Framework: label, Stars: Math.random() }
//     });
//   }

 
//   midAngle(d : any){
//     return d.startAngle + (d.endAngle - d.startAngle)/2;
//   }

//   change(data: any ) {
    
//     const pie = d3.pie<any>().value((d: any) => Number(d.Stars));

//     // Build the pie chart
//     this.svg
//     .selectAll('pieces')
//     .data(pie(data))
//     .enter()
//     .append('path')
//     .attr('d', d3.arc()
//       .innerRadius(0)
//       .outerRadius(this.radius)
//     )
//     .attr('fill', (d: any, i: any) => (this.colors(i)))
//     // .attr("stroke", "#121926")
//     // .style("stroke-width", "1px")
//     .attr("stroke", "white")
//     .style("stroke-width", "2px")
//     .style("opacity", 1)
    
//     // .transition().duration(1000);

//     // Add labels
//     const labelLocation = d3.arc()
//     .innerRadius(100)
//     .outerRadius(this.radius);

//     this.svg
//     .selectAll('pieces')
//     .data(pie(data))
//     .enter()
//     .append('text')
    
//     .transition().duration(1000)
//     .delay(0.5) 
//     .duration(1000)
//     .text((d: { data: { Framework: any; }; }) => d.data.Framework)
//     .attr("transform", (d: d3.DefaultArcObject) => "translate(" + labelLocation.centroid(d) + ")")
//     .style("text-anchor", "middle")
//     .style("font-size", 15);
    
//     var key = function(d: any){ return d.data.label; };

//     var polyline = this.svg.select(".lines").selectAll("polyline")
// 		.data(pie(data), key);
	
// 	polyline.enter()
// 		.append("polyline");

//   var current: any ; 
//   var radius = this.radius ; 
//   // var outerArc : any ; 

//   var arc = d3.arc()
// 	.outerRadius(this.radius * 0.8)
// 	.innerRadius(this.radius * 0.4);

//   var outerArc = d3.arc()
//     .innerRadius(this.radius * 0.9)
//     .outerRadius(this.radius * 0.9);

// 	polyline.transition().duration(1000)
// 		.attrTween("points", (d: any) => {
// 			current = current || d;
// 			var interpolate = d3.interpolate(current, d);
// 			current = interpolate(0);
// 			return function(t: any) {
// 				var d2 = interpolate(t);
// 				var pos = outerArc.centroid(d2);
//         var aux = d2.startAngle + (d2.endAngle - d2.startAngle)/2;
// 				pos[0] = radius * 0.95 * ( aux < Math.PI ? 1 : -1);
// 				return [arc.centroid(d2), outerArc.centroid(d2), pos];
// 			};			
// 		});
	
// 	polyline.exit()
// 		.remove();
    

// }

  

// }


// export class PieChartComponent implements OnInit {

//   // constructor() {}

  
//   // d3.json(data_got).then(function (json)
//   // private data = [
//   //   {"Framework": "Vue", "Stars": "166443", "Released": "2014"},
//   //   {"Framework": "React", "Stars": "150793", "Released": "2013"},
//   //   {"Framework": "Angular", "Stars": "62342", "Released": "2016"},
//   //   {"Framework": "Backbone", "Stars": "27647", "Released": "2010"},
//   //   {"Framework": "Ember", "Stars": "21471", "Released": "2011"},
//   // ];
//   private data: any ; 

//   constructor(private pieChartService:PieChartService) {
  
//     // PieChartService.get_test().then((data:any) => {
      
//     //   this.data = data
//     //   console.log(this.data)
//     // })
//     // console.log(this.data)
//   }

//   private svg: any;
//   private margin = 50;
//   private width = 750;
//   private height = 600;
//   // The radius of the pie chart is half the smallest side
//   private radius = Math.min(this.width, this.height) / 2 - this.margin;
//   private colors: any;
//   // private stroke = innerRadius > 0 ? "none" : "white" ; 
//   // private padAngle: any ; 

  
  
//   private createSvg(): void {
//     this.svg = d3.select("figure#pie")
//     .append("svg")
//     .attr("width", this.width)
//     .attr("height", this.height)
//     .append("g")
//     .attr(
//       "transform",
//       "translate(" + this.width / 2 + "," + this.height / 2 + ")"
//     );
//   }

//   private createColors(): void {
//     this.colors = d3.scaleOrdinal()
//     .domain(this.data.map((d:any) => d.Stars.toString()))
//     .range(d3.schemePaired);
//   }

 
//   private drawChart(): void {
//     // Compute the position of each group on the pie:
//     const pie = d3.pie<any>().value((d: any) => Number(d.Stars));

//     // Build the pie chart
//     this.svg
//     .selectAll('pieces')
//     .data(pie(this.data))
//     .enter()
//     .append('path')
//     .attr('d', d3.arc()
//       .innerRadius(0)
//       .outerRadius(this.radius)
//     )
//     .attr('fill', (d: any, i: any) => (this.colors(i)))
//     // .attr("stroke", "#121926")
//     // .style("stroke-width", "1px")
//     .attr("stroke", "white")
//     .style("stroke-width", "2px")
//     .style("opacity", 1);

//     // Add labels
//     const labelLocation = d3.arc()
//     .innerRadius(100)
//     .outerRadius(this.radius);

//     this.svg
//     .selectAll('pieces')
//     .data(pie(this.data))
//     .enter()
//     .append('text')
//     .text((d: { data: { Framework: any; }; }) => d.data.Framework)
//     .attr("transform", (d: d3.DefaultArcObject) => "translate(" + labelLocation.centroid(d) + ")")
//     .style("text-anchor", "middle")
//     .style("font-size", 15);
//   }

//   ngOnInit(): void {
//     this.pieChartService.get_test().then((data:any) => {
      
//       this.data = data
//       console.log(this.data)
//       this.createSvg();
//       this.createColors();
//       this.drawChart();

//       // this.drawChart();

//       d3.select(".change")
//         .on("click", function(){
//           console.log('Wesh')
//     })
//     })
    
//   }

// }
