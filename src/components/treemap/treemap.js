import React, { useEffect, useState, useRef } from "react";
import seedrandom from "seedrandom";
import * as d3 from "d3";
import * as d3Voronoi from "d3-voronoi-treemap";
//import * as ChartStyles from '../../styles/project-modules/voronoi.module.less'
//import Tooltip from './voronoiTooltip'
//import Legend from './legend'

d3.selection.prototype.moveToFront = function () {
  // d3 function that moves a d3 object to the front
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
}; // end moveToFront function

const formatValue = (value) => {
  if (value === 0) {
    return "$0";
  } else {
    return d3.format("$.2s")(value).replaceAll("G", "B");
  }
};

const Treemap = ({ h_max }) => {
  const [tooltipData, setTooltipData] = useState(null);

  // margin arond chart
  const margin = {
    top: 10,
    right: 10,
    bottom: 0,
    left: 10,
  };
  const svgRef = useRef(null);

  // function that draws the inside of the SVG
  function drawChart() {
    //if (!hierarchy) return;

    /////// define variables up here
    const svg = d3.select(svgRef.current); // svg

    svg.selectAll("*").remove(); // reset on redraw

    // widths
    const w_chart = svgRef.current.clientWidth; // width of the svg
    const w_inner_chart = w_chart - margin.left - margin.right;
    const w_pie = Math.min(w_inner_chart, h_max); // inside width of the chart; maximum width that an element in the chart can have

    let mobile = w_chart < 400;

    // heights
    /* svgRef.current.setAttribute('height', margin.top + w_pie + margin.bottom) // set height of svg

    // generate voronoi
    d3Voronoi.voronoiTreemap()
      .prng(seedrandom(17)) // to make the arrangement the same every time
      .clip(d3.range(100)
        .map(i => [
          (w_pie * (1 + 0.99 * Math.cos((i / 50) * Math.PI))) / 2,
          (w_pie * (1 + 0.99 * Math.sin((i / 50) * Math.PI))) / 2
        ]))
      (hierarchy)

    let allNodes = hierarchy.descendants()
      .sort((a, b) => b.depth - a.depth)
      .map((d, i) => Object.assign({}, d, { id: i }))


    /////// start building elements
    // container
    const container = svg.append('g')
      .attr('class', 'container')
      .attr('transform', `translate(${margin.left + (w_inner_chart - w_pie) / 2}, ${margin.top})`)

    // create each slice
    container.selectAll('slice')
      .data(allNodes)
      .enter()
      .append('path')
      .attr('class', d => `slice slice-${d.data.id}`)
      .attr('d', d => "M" + d.polygon.join("L") + "Z")
      .style('stroke-width', d => d.depth === 1 ? '3px' : '1px')
      .style('fill', d => {
        if (d.depth === 2) {
          return colors[d.data.category].color50

        } else {
          return 'transparent'
        }
      })
      .attr('pointer-events', d => d.depth === 2 ? 'all' : 'none')







    const textGroups = container.selectAll('.textGroup')
      .data(allNodes.filter(k => k.depth === 2))
      .enter()
      .append('g')
      .attr('class', d => `textGroup textGroup-${d.data.id}`)
      .attr('pointer-events', 'none')
      .attr('transform', d => {
        let xVal = d.polygon.site.x;
        if (xVal + 50 >= w_chart) xVal += 3;
        else if (xVal - 45 < 0) xVal -= 8;
        return `translate(${xVal}, ${d.polygon.site.y - 5})`;
      });

    // Append the text
    textGroups.append('text')
      .attr('class', 'deptLabel')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-weight', 'bold')
      .style('font-size', mobile ? 11: 14)
      .attr('pointer-events', 'none')
      .attr('opacity', d => {
        let max1 = 270000000;
        let max2 = 270000000;
        return ((w_pie === h_max && d.data[fiscal_year] > max1) || (w_pie < h_max && d.data[fiscal_year] > max2)) ? 1 : 0;
      })
      .style('text-anchor', d => {
        if (d.polygon.site.x + 50 >= w_inner_chart) return 'end';
        if (d.polygon.site.x - 45 < 0) return 'start';
        return 'middle';
      })
      .each(function (d) {
        const lines = d.data.name_short.split('\\n');
        d3.select(this)
          .selectAll('tspan')
          .data(lines)
          .enter()
          .append('tspan')
          .attr('x', 0)
          .attr('dy', (d, i) => i === 0 ? 0 : '1.1em')
          .text(line => line);
      });


    textGroups
      .append('text')
      .attr('class', 'budgetLabel')
      .attr('x', 0)
      .attr('y', d => d.data.name_short.includes('\\n') ? 35 : 15)
      .text(d => formatValue(parseInt(d.data[fiscal_year])))
      .attr('pointer-events', 'none')
      .style('font-size', mobile ? 11: 14)
      .attr('opacity', d => {
        let max1 = 270000000
        let max2 = 270000000
        if ((w_pie === h_max && d.data[fiscal_year] > max1) || (w_pie < h_max && d.data[fiscal_year] > max2)) {
          return 1
        } else {
          return 0
        }
      })
      .style('text-anchor', d => {
        if (d.polygon.site.x + 50 >= w_inner_chart) {
          return 'end'
        } else if (d.polygon.site.x - 45 < 0) {
          return 'start'
        } else {
          return 'middle'
        }
      })

    // Now add rect *after* text so we can size it using getBBox()
    textGroups.each(function () {
      const group = d3.select(this);

      //console.log('group is ', group)
      const text = group.selectAll('.deptLabel');
      //console.log('text is ', text)
      const bbox = text.node().getBBox();

      // Append a rect behind the text
      group.insert('rect', 'text')
        .attr('x', bbox.x - 5)
        .attr('y', bbox.y - 3)
        .attr('width', bbox.width + 12)
        .attr('height', bbox.height + 22)
        .attr('fill', 'white')
        .attr('class', d => `backgroundBox rect-${d.data.id}`)
        .attr('opacity', 0)
        

    });







    /////////////////////
    /*  container.selectAll('textGroup')
     .data(allNodes.filter(k => k.depth === 2))
     .enter()
     .append('g')
     .attr('class', d=> `textGroup textGroup-${d.data.id}`)
     .attr('transform', d => {
       let xVal = d.polygon.site.x
       if (xVal + 50 >= w_chart) { // too right
         xVal = xVal + 3
       } else if (xVal - 45 < 0) {
         xVal = xVal -8
       }
       return `translate(${xVal}, ${d.polygon.site.y-5})`
     })
 
     container.selectAll('.textGroup')
     .append('text')
     .attr('class', 'deptLabel')
     .attr('x', 0)
     .attr('y', 0)
     .text(d => d.data.name_short) 
     .attr('font-weight', 'bold')
 
     .attr('opacity', d => {
       let max1 = 99000000
       let max2 = 99000000
       if ((w_pie === h_max && d.data[fiscal_year] > max1) || (w_pie < h_max && d.data[fiscal_year] > max2)) {
         return 1
       } else {
         return 0
       }
     })
     .style('text-anchor', d => {
       if (d.polygon.site.x + 50 >= w_chart) {
         return 'end'
       } else if (d.polygon.site.x - 45 < 0) {
         return 'start'
       } else {
         return 'middle'
       }
     })
 
      container.selectAll('.textGroup')
     .append('text')
     .attr('class', 'budgetLabel')
     .attr('x', 0)
     .attr('y', 15)
     .text(d => formatValue(parseInt(d.data[fiscal_year])))
     .attr('opacity', d => {
       let max1 = 99000000
       let max2 = 99000000
       if ((w_pie === h_max && d.data[fiscal_year] > max1) || (w_pie < h_max && d.data[fiscal_year] > max2)) {
         return 1
       } else {
         return 0
       }
     })
     .style('text-anchor', d => {
       if (d.polygon.site.x + 50 >= w_chart) {
         return 'end'
       } else if (d.polygon.site.x - 45 < 0) {
         return 'start'
       } else {
         return 'middle'
       }
     }) 
  */
    /* container.selectAll('.slice')
      .on('mouseenter', function () {

        setTooltipData(d3.select(this).data()[0].data)

        const deptId = d3.select(this).data()[0].data.id

        svg.selectAll('.textGroup').classed('hide', true)

        svg.selectAll(`.textGroup-${deptId}`)
          .classed('hide', false)
          .classed('highlight', true)
          .moveToFront()

        d3.select(this).classed('highlight', true)

      })
      .on('mouseleave', function () {
        setTooltipData(null)

        svg.selectAll('.textGroup').classed('hide', false).classed('highlight', false)

        d3.select(this).classed('highlight', false)
      })

  }*/
  }

  // use effect since the chart depends on the svg dimensions
  /* useEffect(() => {
    drawChart()
    setTooltipData(null)

    // resize
    let resizedFn
    window.addEventListener('resize', () => {
      clearTimeout(resizedFn)
      resizedFn = setTimeout(() => {
        svgRef.current.innerHTML = '' // clear contents
        drawChart() // rebuild
        setTooltipData(null)
      }, 200)
    })
  }, [hierarchy]) */

  useEffect(() => {
    drawChart();

    // resize
    let resizedFn;
    window.addEventListener("resize", () => {
      clearTimeout(resizedFn);
      resizedFn = setTimeout(() => {
        //svgRef.current.innerHTML = ""; // clear contents
        drawChart(); // rebuild
        //setTooltipData(null)
      }, 200);
    });
  }, []);

  return <div ref={svgRef}>Hi there idiots</div>;
};

export default Treemap;
