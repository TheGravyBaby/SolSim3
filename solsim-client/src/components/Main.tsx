import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { OrbitBody, Position } from "../models/body";
import { Subscription } from 'rxjs';
import orbitService from '../services/orbitService';

const Main: React.FC = () => {
  const d3Container = useRef<SVGSVGElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  const [xTheta, setXTheta] = useState(15); // 15
  const [yTheta, setYTheta] = useState(-15); // -15
  const [zTheta, setZTheta] = useState(-2.5);
  const [projDist, setProjDist] = useState(10 * Math.pow(10, 9));
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [bodyArr, setBodyArr] = useState<OrbitBody[]>([]);


  const handleResize = () => {
    setViewportWidth(window.innerWidth);
    setViewportHeight(window.innerHeight);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Refs for dragging state
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const isPanningRef = useRef(false);

  useEffect(() => {   
    const svg = d3.select(d3Container.current);
    if (!svg) return;

    const renderAxis = () => {
      // Axis lines data
      const axes = [
        { start: { X: 0, Y: 0, Z: 0 }, end: { X: 200, Y: 0, Z: 0 }, color: 'red' }, // X-aXis
        { start: { X: 0, Y: 0, Z: 0 }, end: { X: -200, Y: 0, Z: 0 }, color: 'greY' }, // X-aXis

        { start: { X: 0, Y: 0, Z: 0 }, end: { X: 0, Y: 200, Z: 0 }, color: 'green' }, // Y-aXis
        { start: { X: 0, Y: 0, Z: 0 }, end: { X: 0, Y: -200, Z: 0 }, color: 'greY' }, // Y-aXis

        { start: { X: 0, Y: 0, Z: 0 }, end: { X: 0, Y: 0, Z: 200 }, color: 'blue' }, // Z-aXis
        { start: { X: 0, Y: 0, Z: 0 }, end: { X: 0, Y: 0, Z: -200 }, color: 'greY' } // Z-aXis
      ];

      // Draw axis lines
      axes.forEach(axis => {
        const start = project3dPointTo2d(axis.start, xTheta, yTheta, zTheta);
        const end = project3dPointTo2d(axis.end, xTheta, yTheta, zTheta);

        svg.append('line')
          .attr('x1', (start.x + (viewportWidth / 2) + offsetX) / 1) 
          .attr('y1', (start.y + (viewportHeight * .9 / 2) + offsetY)/ 1)
          .attr('x2', (end.x + (viewportWidth / 2) + offsetX) / 1)
          .attr('y2', (-end.y + (viewportHeight * .9 / 2) + offsetY) / 1)
          .attr('stroke', axis.color)
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.3); // Fading effect
      });
    }

    const renderBodies = (bodyArr: OrbitBody[]) => {
      svg.selectAll('*').remove(); // Clear previous elements

      // Draw bodies
      svg.selectAll('circle')
        .data(bodyArr)
        .enter()
        .append('circle')
        .attr('cx', d => (project3dPointTo2d(d.Position, xTheta, yTheta, zTheta).x / projDist + (viewportWidth / 2) + offsetX))
        .attr('cy', d => (-project3dPointTo2d(d.Position, xTheta, yTheta, zTheta).y / projDist + (viewportHeight * .9 / 2) + offsetY))
        .attr('r', d => d.PixelRadius)
        .attr('fill', d => d.Color);
    };

    // Mouse events for rotation and panning
    const onMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      lastXRef.current = event.clientX;
      lastYRef.current = event.clientY;
    };

    const onMouseMove = (event: MouseEvent) => {
      isPanningRef.current = event.shiftKey;
      if (!isDraggingRef.current) return;

      const deltaX = event.clientX - lastXRef.current;
      const deltaY = event.clientY - lastYRef.current;
      lastXRef.current = event.clientX;
      lastYRef.current = event.clientY;

      if (isPanningRef.current) {
        setOffsetX(prev => prev + deltaX);
        setOffsetY(prev => prev + deltaY);
      } else {
        setXTheta(prev => prev + deltaY * 0.1); // Adjust sensitivity as needed
        setYTheta(prev => prev + deltaX * 0.1);
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onScrollWheel = (event: WheelEvent) => {
      // to improve the function, find where the mouse is pointing and adjust the offset
      // such that each zoom also causes a drag
      event.preventDefault();
      const delta = projDist * event.deltaY * 0.001;
      setProjDist(prev => prev + delta);
    };

    svg.on('mousedown', onMouseDown);
    svg.on('mousemove', onMouseMove);
    svg.on('mouseup', onMouseUp);
    svg.on('mouseleave', onMouseUp);
    svg.on('wheel', onScrollWheel);

    const subscription: Subscription = orbitService.getOrbitBodiesObservable().subscribe((newBodies) => {
      setBodyArr(newBodies);
      renderBodies(newBodies);
      renderAxis();
    });

    return () => {
      subscription.unsubscribe();
      svg.on('mousedown', null);
      svg.on('mousemove', null);
      svg.on('mouseup', null);
      svg.on('mouseleave', null);
      svg.on('wheel', null);
    };
  }, [xTheta, yTheta, zTheta, projDist, offsetX, offsetY]);

  return (
    <div className="main">
      <svg className="d3-canvas" ref={d3Container} width="100%" height="90%"></svg>
    </div>
  );
};


const project3dPointTo2d = (position: Position, xTheta: number, yTheta: number, zTheta: number): { x: number, y: number } => {
  const xThetaRad = xTheta * (Math.PI / 180);
  const yThetaRad = yTheta * (Math.PI / 180);
  const zThetaRad = zTheta * (Math.PI / 180);

  const x1 = position.X;
  const y1 = position.Y * Math.cos(xThetaRad) - position.Z * Math.sin(xThetaRad);
  const z1 = position.Y * Math.sin(xThetaRad) + position.Z * Math.cos(xThetaRad);

  const x2 = x1 * Math.cos(yThetaRad) + z1 * Math.sin(yThetaRad);
  const y2 = y1;
  const z2 = -x1 * Math.sin(yThetaRad) + z1 * Math.cos(yThetaRad);

  const x3 = x2 * Math.cos(zThetaRad) - y2 * Math.sin(zThetaRad);
  const y3 = x2 * Math.sin(zThetaRad) + y2 * Math.cos(zThetaRad);
  const z3 = z2;

  const x = x2 
  const y = y2 

  return { x, y };
};


export default Main;