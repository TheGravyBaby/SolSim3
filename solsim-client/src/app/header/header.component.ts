import { Component } from '@angular/core';
import { PerformanceComponent } from '../performance/performance.component';
import { solSystem } from '../solSystems/sol'
import { newButter, newEmpty, newFigure8, newMoth, newPythag } from '../solSystems/weirdos'
import { OrbitBody } from '../models/models';
import { CommonModule } from '@angular/common';
import { ControlsService } from '../services/controls.service';
import { OrbitService } from '../services/orbit.service';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, PerformanceComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  selectedIndex = 0;
  solSystemsArray: any[] = [
    {
      "name": "Sol",
      "system": solSystem,
    },
    {
      "name": "Moth",
      "system": newMoth,
    },
    {
      "name": "Figure8",
      "system": newFigure8,
    },
    {
      "name": "Pythag",
      "system": newPythag,
    },
    {
      "name": "Butterly",
      "system": newButter,
    },
    {
      "name": "Sol",
      "system": newEmpty,
    }
  ]
  currentSystem = this.solSystemsArray[this.selectedIndex].systen

  granularityArray = [1, 5, 10, 30, 60, 120, 180, 360, 6000]
  granularityIndex = 4

  bodyIndex = 0;

  constructor(private ctrl: ControlsService, private orbs: OrbitService) {

    this.orbs.solSystemFrame$.subscribe(f => {
      this.currentSystem = f;
    })
  }


  solSystemChanged(event: any) {
    this.solSystemsArray[this.selectedIndex].system = this.currentSystem;
    // console.log(this.solSystemsArray)
    this.selectedIndex = event.target.value;
    const selectedSystem = this.solSystemsArray[this.selectedIndex].system;
    this.ctrl.changeSol(selectedSystem);
  }

  async granularityChangeEvent(event: any) {
    this.granularityIndex = event.target.value;
    this.orbs.changeGranularity(this.granularityArray[this.granularityIndex]);
  }

  bodySelectedChangeEvent(event: any) {
    this.bodyIndex = event.target.value;    
    var name = this.solSystemsArray[this.selectedIndex].system[this.bodyIndex].RenderData.Name
    this.ctrl.changeBody(name);
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
