import { Component } from '@angular/core';
import { OrbitService } from '../services/orbit.service';
import { ControlsService } from '../services/controls.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  isConnected = false;

  constructor(private orbs: OrbitService, private ctrl: ControlsService ) {
    this.orbs.connectionStatus$.subscribe(status => {
      this.isConnected = status;
    });
  }

  toggleConnection() {
    if (this.isConnected) {
      this.orbs.disconnectWebSocket();
    } else {
      this.orbs.connectWebSocket();
    }
  }

  togglePaths() {
    this.ctrl.togglePaths();
  }

  resetPaths() {
    this.ctrl.resetPaths();
  }

  recenter() {
    this.ctrl.recenter();
  }
}
