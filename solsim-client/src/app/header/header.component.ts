import { Component } from '@angular/core';
import { PerformanceComponent } from '../performance/performance.component';
import { solSystem } from '../solSystems/sol'
import { newMoth } from '../solSystems/weirdos'
import { OrbitBody } from '../models/models';
import { CommonModule } from '@angular/common';
import { ControlsService } from '../services/controls.service';
import { OrbitService } from '../services/orbit.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [PerformanceComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  selectedIndex = 0;
  solSystemsArray: OrbitBody[][] = [
    solSystem, newMoth
  ]
  currentSystem = this.solSystemsArray[this.selectedIndex]

  constructor(private ctrl: ControlsService, private orbs: OrbitService) {

    this.orbs.solSystemFrame$.subscribe(f => {
      this.currentSystem = f;
    })
  }


  solSystemChanged(event: any) {
    this.solSystemsArray[this.selectedIndex] = this.currentSystem;
    // console.log(this.solSystemsArray)
    this.selectedIndex = event.target.value;
    const selectedSystem = this.solSystemsArray[this.selectedIndex];
    this.ctrl.changeSol(selectedSystem);

  }
}
