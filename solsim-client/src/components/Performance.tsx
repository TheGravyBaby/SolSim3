import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import orbitService from '../services/orbitService';


const Performance: React.FC = () => {
  const [calcsPerFrame, setCalcsPerFrame] = useState(0);
  const [totalCalcs, setTotalCalcs] = useState(0);

  const dataRef = useRef<number[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [shitGraph, setShitGraph] = useState(true)

  useEffect(() => {
    const subscription = orbitService.getCalcDataObservable().subscribe(s => {
      setCalcsPerFrame(s.CalcsPerSecond);
      setTotalCalcs(s.TotalCalcs);

    });

    // Clean up the subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (svgRef.current) { 
      const svg = d3.select(svgRef.current);
      const width = 300;
      const height = 100;
      const margin = { top: 30, right: 0, bottom: 30, left: 50 };


      // Append new data point
      dataRef.current.push(calcsPerFrame);

      if (dataRef.current.length > 300) dataRef.current.shift();
      else if (shitGraph && dataRef.current.length > 10) {
        setShitGraph(false)
        dataRef.current.splice(0,10)
        return;
      }

      // Set the scales
      const xScale = d3.scaleLinear()
        .domain([0, dataRef.current.length - 1])
        .range([margin.left, width - margin.right]);

      const yScale = d3.scaleLinear()
        .domain([d3.min(dataRef.current, d => d || 0), d3.max(dataRef.current, d => d) || 0])
        .range([height - margin.bottom, margin.top]);

      // Define the line
      const line = d3.line<number>()
        .x((d, i) => xScale(i))
        .y(d => yScale(d))
        .curve(d3.curveMonotoneX);

      // Clear previous lines
      svg.selectAll("*").remove();

      // Draw the line
      svg.append('g')
        .append('path')
        .datum(dataRef.current)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);


      const yExtent = d3.extent(dataRef.current);
      const [minY, maxY] = yExtent;
    
      // Append the Y axis
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(
          d3.axisLeft(yScale)
          .tickValues([minY, maxY]) 
          .tickFormat(d3.format(".0f"))
        ); 
        
      svg.append('text')
        .attr('x', width)
        .attr('y', height-15)
        .attr('dy', '1em')
        .attr('text-anchor', 'end')
        .style("font", "10px arial")
        .attr('fill', 'white')
        .text(`${calcsPerFrame} Calcs/s`);

    // svg.append('text')
    //     .attr('x', width)
    //     .attr('y', height )
    //     .attr('dy', '1em')
    //     .attr('text-anchor', 'end')
    //     .style("font", "10px arial")
    //     .attr('fill', 'white')
    //     .text(`${totalCalcs} Calcs`);
        
    }
  }, [calcsPerFrame]);

  return (
    <div className="performanceView">
        <svg className="performanceCanvas" ref={svgRef} ></svg>
    </div>
  );
};

export default Performance;