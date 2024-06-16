import { Component, ElementRef, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { OrbitBody, Position } from '../models/models';
import * as d3 from 'd3';
import { OrbitService } from '../services/orbit.service';
import { ControlsService } from '../services/controls.service';


@Component({
  selector: 'app-canvas',
  imports: [],
  standalone: true,
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent {

  private cam = {xTheta: 15, yTheta: 15, zTheta: -25,  offsetX: 0, offsetY: 0, projDist: 10 * Math.pow(10, 9)};
  private solSystem?: OrbitBody[];
  private viewportWidth = window.innerWidth;
  private viewportHeight = window.innerHeight;

  private lastXRef = 0;
  private lastYRef = 0;
  private isPanningRef = false;
  private isDraggingRef = false;

  private renderPaths = true;
  private renderVectors = false;
  private renderGrid = false;


  constructor(private orbs: OrbitService, private ctrl: ControlsService, private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.orbs.solSystemFrame$.subscribe((newBodies) => {
      // console.log("Recieved new orbit frame: ", newBodies)
      this.solSystem = newBodies;
      this.renderCanvas();
    });
    this.ctrl.recenter$.subscribe(() => this.recenter());
    this.ctrl.togglePaths$.subscribe(() => {this.renderPaths = !this.renderPaths; this.renderCanvas()});
    this.ctrl.resetPaths$.subscribe(() => this.resetPaths());
    this.ctrl.toggleVectors$.subscribe(() => this.renderVectors = !this.renderVectors);
    this.ctrl.toggleGrid$.subscribe(() => this.renderGrid = !this.renderGrid);

    this.renderCanvas();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.renderCanvas();
  }

  renderCanvas(): void {
    const svg = d3.select(this.elementRef.nativeElement).select('.d3-canvas');
    svg.attr('width', '100%').attr('height', '100%');

    this.renderBodies(this.solSystem ?? [], svg);
    this.renderAxis(svg);
  }

  renderBodies = (bodyArr: OrbitBody[], svg: any) => {
    svg.selectAll('*').remove(); // Clear previous elements

    const lineGenerator = d3.line<Position>()
      .x(d => this.project3dPointTo2d(d, this.cam.xTheta, this.cam.yTheta, this.cam.zTheta).x / this.cam.projDist + (this.viewportWidth / 2) + this.cam.offsetX)
      .y(d => -this.project3dPointTo2d(d, this.cam.xTheta, this.cam.yTheta, this.cam.zTheta).y / this.cam.projDist + (this.viewportHeight / 2) + this.cam.offsetY);

    if (this.renderPaths) {
      bodyArr.forEach(body => {
        if (body.RenderData!.Path && body.RenderData!.Path.length > 1) {
          svg.append('path')
            .datum(body.RenderData!.Path)
            .attr('fill', 'none')
            .attr('stroke', body.RenderData!.Color)
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.3) // Fading effect
            .attr('d', lineGenerator);
        }
      });
    }

    // Draw bodies
    svg.selectAll('circle')
        .data(bodyArr)
        .enter()
        .append('circle')
        .attr('cx', (d: { Position: any; }) => (this.project3dPointTo2d(d.Position, this.cam.xTheta, this.cam.yTheta, this.cam.zTheta).x / this.cam.projDist + (this.viewportWidth / 2) + this.cam.offsetX))
        .attr('cy', (d: { Position: any; }) => (-this.project3dPointTo2d(d.Position, this.cam.xTheta, this.cam.yTheta, this.cam.zTheta).y / this.cam.projDist + (this.viewportHeight / 2) + this.cam.offsetY))
        .attr('r', (d: { RenderData: { PixelRadius: any; }; }) => d.RenderData.PixelRadius)
        .attr('z-axis', 100)
        .attr('fill', (d: { RenderData: { Color: any; }; }) => d.RenderData.Color);

  }

  renderAxis = (svg: any) => {
    // Axis lines data
    const axes = [
      { start: { X: 0, Y: 0, Z: 0 }, end: { X: 300, Y: 0, Z: 0 }, color: 'red' }, // X-aXis
      { start: { X: 0, Y: 0, Z: 0 }, end: { X: -300, Y: 0, Z: 0 }, color: 'greY' }, // X-aXis

      { start: { X: 0, Y: 0, Z: 0 }, end: { X: 0, Y: 300, Z: 0 }, color: 'green' }, // Y-aXis
      { start: { X: 0, Y: 0, Z: 0 }, end: { X: 0, Y: -300, Z: 0 }, color: 'greY' }, // Y-aXis

      { start: { X: 0, Y: 0, Z: 0 }, end: { X: 0, Y: 0, Z: 300 }, color: 'blue' }, // Z-aXis
      { start: { X: 0, Y: 0, Z: 0 }, end: { X: 0, Y: 0, Z: -300 }, color: 'greY' } // Z-aXis
    ];

    // Draw axis lines
    axes.forEach(axis => {
      const start = this.project3dPointTo2d(axis.start, this.cam.xTheta, this.cam.yTheta, this.cam.zTheta);
      const end = this.project3dPointTo2d(axis.end, this.cam.xTheta, this.cam.yTheta, this.cam.zTheta);

      svg.append('line')
        .attr('x1', (start.x + (this.viewportWidth / 2) + this.cam.offsetX) / 1) 
        .attr('y1', (start.y + (this.viewportHeight / 2) + this.cam.offsetY)/ 1)
        .attr('x2', (end.x + (this.viewportWidth / 2) + this.cam.offsetX) / 1)
        .attr('y2', (-end.y + (this.viewportHeight / 2) + this.cam.offsetY) / 1)
        .attr('stroke', axis.color)
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.1); // Fading effect
    });
  }

  project3dPointTo2d = (position: Position, xTheta: number, yTheta: number, zTheta: number): { x: number, y: number } => {
  
    // Rotation Matrix
    // Rx = 
    // [ 1      0        0   ]
    // [ 0  cos(θ)  -sin(θ)  ]
    // [ 0  sin(θ)   cos(θ)  ]
    // Ry = 
    // [  cos(θ)   0  sin(θ)  ]
    // [      0    1      0   ]
    // [ -sin(θ)   0  cos(θ)  ]
    // Rz = 
    // [  cos(θ)  -sin(θ)  0  ]
    // [  sin(θ)   cos(θ)  0  ]
    // [      0        0   1  ]
  
    // some vector with coordinates in the xyz plane, v0
    //      [vx]
    // v0 = [vy]
    //      [vz]
  
    // we can think of rotation about the axis as a series
    // rotate once on x, once on y, once z
    // v1 = v0 * Rx
    // v2 = v1 * Ry
    // v3 = v2 * Rz 
  
    // the resultant vector contains x,y,z coordinates that have been rotated
    // for rendering on a 2d surface, take x and y
  
    // below we do this out manually
    // each represented as the sum of the individual multiplications
    const x1 = position.X;
    const y1 = position.Y * Math.cos(xTheta) - position.Z * Math.sin(xTheta);
    const z1 = position.Y * Math.sin(xTheta) + position.Z * Math.cos(xTheta);
  
    const x2 = x1 * Math.cos(yTheta) + z1 * Math.sin(yTheta);
    const y2 = y1;
    const z2 = -x1 * Math.sin(yTheta) + z1 * Math.cos(yTheta);
  
    const x3 = x2 * Math.cos(zTheta) - y2 * Math.sin(zTheta);
    const y3 = x2 * Math.sin(zTheta) + y2 * Math.cos(zTheta);
    const z3 = z2;
  
    const x = x2 
    const y = y2 
  
    return { x, y };
  };
  

  onMouseDown = (event: MouseEvent) => {
    this.isDraggingRef = true;
    this.lastXRef = event.clientX;
    this.lastYRef = event.clientY;
    // console.log("Click!")
  };

  onMouseUp = () => {
    this.isDraggingRef = false;
    this.renderCanvas();
    // console.log("Mouse Up!")
  };

  onScrollWheel = (event: WheelEvent) => {
    // to improve the function, find where the mouse is pointing and adjust the offset
    // such that each zoom also causes a drag
    event.preventDefault();
    const delta = this.cam.projDist * event.deltaY * 0.001;
    this.cam.projDist += delta;
    this.renderCanvas();
    // console.log("Scrollin!")
  };

  onMouseMove = (event: MouseEvent) => {
    this.isPanningRef = event.shiftKey;
      if (!this.isDraggingRef) return;

    const deltaX = event.clientX - this.lastXRef;
    const deltaY = event.clientY - this.lastYRef;
    this.lastXRef = event.clientX;
    this.lastYRef = event.clientY;

    if (this.isPanningRef) {
      this.cam.offsetX += deltaX;
      this.cam.offsetY += deltaY;
    } else {
      this.cam.xTheta +=  deltaY * 0.01; 
      this.cam.yTheta +=  deltaX * 0.01; 
    }
    this.renderCanvas();
  };

  recenter() {
    this.cam = {xTheta: 15, yTheta: 15, zTheta: -25,  offsetX: 0, offsetY: 0, projDist: 10 * Math.pow(10, 9)}
  }

  resetPaths() {

  }

}
