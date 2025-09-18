import React, { useEffect, useState, useRef, useMemo } from "react";
import seedrandom from "seedrandom";
import * as d3 from "d3";
import * as d3Voronoi from "d3-voronoi-treemap";
import styles from './treemap.module.css'
//import * as ChartStyles from '../../styles/project-modules/voronoi.module.less'
//import Tooltip from './voronoiTooltip'
//import Legend from './legend'


// helper function to raise slices on mouseenter
d3.selection.prototype.moveToFront = function () {
  // d3 function that moves a d3 object to the front
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function () {
  return this.each(function () {
    const firstSibling = this.parentNode.firstChild;
    if (firstSibling) {
      this.parentNode.insertBefore(this, firstSibling);
    }
  });
};

// helper function for formatting currency
const formatValue = (value) => {
  if (value === 0) {
    return "$0";
  } else {
    return d3.format("$.2s")(value).replaceAll("G", "B");
  }
};

const Treemap = ({ h_max, hierarchy, setTooltipData, colors }) => {
  //const [tooltipData, setTooltipData] = useState(null);

  // margin arond chart
  const margin = {
    top: 10,
    right: 10,
    bottom: 0,
    left: 10,
  };
  const svgRef = useRef(null);

  /* const colors = useMemo(() => {
  if (!hierarchy) return {};

  const leafNodes = hierarchy.leaves?.() || [];
  const uniqueSectors = [...new Set(leafNodes.map((d) => d.data.sector))];

  const minColor = "#CFE0EF"; // light blue (min)
  const maxColor = "#003166"; // dark teal (max)

  const interpolator = d3.interpolateLab(minColor, maxColor);
  const n = uniqueSectors.length;

  return Object.fromEntries(
    uniqueSectors.map((sector, i) => [
      sector,
      { color50: interpolator(i / (n - 1)) }
    ])
  );
}, [hierarchy]); */

  // function that draws the inside of the SVG
  function drawChart() {
    if (!hierarchy) return;

    /////// define variables up here
    const svg = d3.select(svgRef.current); // svg



    svg.selectAll("*").remove(); // reset on redraw

    // widths
    const w_chart = svgRef.current.clientWidth; // width of the svg
    //const w_chart = 1000
    const w_inner_chart = w_chart - margin.left - margin.right;
    const w_pie = Math.min(w_inner_chart, h_max); // inside width of the chart; maximum width that an element in the chart can have

    let mobile = w_chart < 400;

    // heights
    svgRef.current.setAttribute('height', `${margin.top + w_pie + margin.bottom}px`) // set height of svg

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
      .attr('class', styles.container)
      .attr('transform', `translate(${margin.left + (w_inner_chart - w_pie) / 2}, ${margin.top})`)

    // create each slice
    container.selectAll(styles.slice)
      .data(allNodes)
      .enter()
      .append('path')
      .attr('class', d => `${styles.slice} slice-${d.data.id}`)
      .attr('d', d => "M" + d.polygon.join("L") + "Z")
      .style('stroke-width', d => d.depth === 1 ? '4px' : '1px')
      .style('stroke', d => d.depth !== 2 ? 'white' : '#d3d3d3')
      .style('fill', d => {
        if (d.depth === 2) {
          const sector = d.data.sector;
          const colorObj = colors[sector];

          if (!colorObj) {
            return "#ccc"; // fallback
          }

          return colorObj.color50;
        } else {
          return "transparent";
        }
      })
      .attr('pointer-events', d => d.depth === 2 ? 'all' : 'none')

    const textGroups = container.selectAll(styles.textGroup)
      .data(allNodes.filter(k => k.depth === 2))
      .enter()
      .append('g')
      .attr('class', d => `${styles.textGroup} ${styles.textGroup}-${d.data.id} ${styles.hide}`)
      .attr('pointer-events', 'none')
      .attr('transform', d => {
        let xVal = d.polygon.site.x;
        if (xVal + 50 >= w_chart) xVal += 3;
        else if (xVal - 45 < 0) xVal -= 8;
        return `translate(${xVal}, ${d.polygon.site.y - 5})`;
      });

    // Append the text
    textGroups.append('text')
      .attr('class', styles.stockName)
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-weight', 'bold')
      .style('font-size', 14)
      .attr('pointer-events', 'none')
      .style('text-anchor', d => {
        if (d.polygon.site.x + 50 >= w_inner_chart) return 'end';
        if (d.polygon.site.x - 45 < 0) return 'start';
        return 'middle';
      })
      .style('fill', d => colors?.[d.data.sector]?.textcolor || 'black')
      .each(function (d) {
        d3.select(this)
          .append('tspan')
          .attr('x', 0)
          .attr('dy', 0)
          .text(d => d.data.Name);
      });

    textGroups
      .append('text')
      .attr('class', styles.sectorLabel)
      .attr('x', 0)
      .attr('y', 15)
      .text(d => d.data.sector)
      .attr('pointer-events', 'none')
      .style('font-size', 12)
      .style('text-anchor', d => {
        if (d.polygon.site.x + 50 >= w_inner_chart) {
          return 'end'
        } else if (d.polygon.site.x - 45 < 0) {
          return 'start'
        } else {
          return 'middle'
        }
      })
      .style('fill', d => colors?.[d.data.sector]?.textcolor || 'black')






    container.selectAll(`.${styles.slice}`)
      .on('mouseenter', function () {

        //setTooltipData(d3.select(this).data()[0].data)

        const sectorId = d3.select(this).data()[0].data.id

        setTooltipData(d3.select(this).data()[0].data)

        //hide all labels
        svg.selectAll(`.${styles.textGroup}`).classed(styles.hide, true)

        // higlight the slice
        d3.select(this).classed(styles.highlight, true).moveToFront()

        // show text group for highlighted slice
        svg.selectAll(`.${styles.textGroup}-${sectorId}`)
          .classed(styles.hide, false)
          .classed(styles.highlight, true)
          .moveToFront() 
      })
      .on('mouseleave', function () {
        const sectorId = d3.select(this).data()[0].data.id
        //setTooltipData(null)

        setTooltipData(null)

        d3.select(this).classed(styles.highlight, false).moveToBack()

        svg.selectAll(`.${styles.textGroup}-${sectorId}`)
          .classed(styles.hide, true)
          .classed(styles.highlight, false)

        
      })


  }

  // use effect since the chart depends on the svg dimensions

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

  return (
  <>
    <svg className={styles.svg} ref={svgRef}>
    </svg>
  </>
  )
};

export default Treemap;
