import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { OrbitService } from '../services/orbit.service';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css'
})

export class PerformanceComponent  {
  private calcsPerFrame = 0;
  private totalCalcs = 0;
  private data: number[] = [];
  private svgRef!: SVGSVGElement;
  private isShitGraph = true;

  constructor(private orbitService: OrbitService, private elementRef: ElementRef) {}

  ngOnInit(): void {
     this.orbitService.calcDataFrame$.subscribe(s => {
      this.calcsPerFrame = s.CalcsPerSecond;
      this.totalCalcs = s.TotalCalcs;
      this.updateGraph();
    });
  }

  ngAfterViewInit(): void {
    this.svgRef = this.elementRef.nativeElement.querySelector('.performanceCanvas');
    this.updateGraph();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateGraph();
  }

  private updateGraph(): void {
    if (!this.svgRef) return;

    const svg = d3.select(this.svgRef);
    const boundingRect = this.elementRef.nativeElement.getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;
    const margin = { top: 5, right: 0, bottom: 5, left: 50 };

    // Append new data point
    this.data.push(this.calcsPerFrame);

    if (this.data.length > 300) this.data.shift();
    else if (this.isShitGraph && this.data.length > 10) {
      this.isShitGraph = false;
      this.data.splice(0, 10);
      return;
    }

    const yMin = d3.min(this.data, d => d || 0) ?? 0;
    const yMax = d3.max(this.data, d => d || 0) ?? 0;

    // Set the scales
    const xScale = d3.scaleLinear()
      .domain([0, this.data.length - 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height - margin.bottom, margin.top]);

    // Define the line
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    // Clear previous lines
    svg.selectAll('*').remove();

    // Draw the line
    svg.append('g')
      .append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    const yExtent = d3.extent(this.data);
    const [minY, maxY] = yExtent;

    // Append the Y axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .tickValues([minY ?? 0, maxY ?? 0])
        .tickFormat(d3.format('.0f'))
      );

    svg.append('text')
      .attr('x', 10)
      .attr('y', 25)
      .attr('dy', '1em')
      .attr('text-anchor', 'start')
      .style('font', '10px arial')
      .attr('fill', 'white')
      .text(`Calcs/s`);
  }
}