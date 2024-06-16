import { BehaviorSubject } from 'rxjs';
import { solSystem } from '../solSystems/sol';
import { CalculationSettings, OrbitBody } from '../models/models';
import { ControlsService } from './controls.service';
import { Injectable } from '@angular/core';

@Injectable()
export class OrbitService {
  private solSystemFrame = new BehaviorSubject<OrbitBody[]>(solSystem);
          solSystemFrame$ = this.solSystemFrame.asObservable();

  private calcDataFrame =  new BehaviorSubject<any>({CalcsPerFrame: 0});
          calcDataFrame$ = this.calcDataFrame.asObservable()
  
  private connectionStatus = new BehaviorSubject<boolean>(false);
          connectionStatus$ = this.connectionStatus.asObservable();

  
  private socket?: WebSocket;
  private savedFrame: OrbitBody[];
  private frameCounter: number = 0;
  private framesPerPathSave = 6; 

  private calcSet: CalculationSettings = {
    Granularity: 60,
    VerletInt: false,
    Collisions: false
  }

  constructor(private ctrl: ControlsService) {
    this.savedFrame = solSystem
    console.log("Orbit Service Started.")

    this.ctrl.resetPaths$.subscribe( () => {
      this.savedFrame.forEach(sf => sf.RenderData.Path = [])
    })

    this.ctrl.newSolSystem$.subscribe(s => {
      console.log(s)
      this.disconnectWebSocket();
      this.solSystemFrame.next(s);
      this.savedFrame = s;
      
    })
  }


  connectWebSocket() {
    this.socket = new WebSocket('ws://localhost:8080/solsim/ws');

    this.socket.onopen = () => {
      console.log("Connecting to socket...")
      this.connectionStatus.next(true);

      var socketRequest = JSON.stringify({
        Settings: this.calcSet,
        OrbitBodies: this.solSystemFrame.value ?? this.savedFrame
      });

      // console.log("Request To Socket: ", data)
      this.savedFrame =  this.savedFrame ?? this.savedFrame
      this.socket!.send(socketRequest);
    };

    this.socket.onmessage = (event) => {
      let data = JSON.parse(event.data)

      // determine if this is a body of path data, which is quite large
      // and will gunk up the logs
      if (data.OrbitBodies) {
        this.frameCounter++
        var orbitData = data.OrbitBodies
        var calcData = data.CalcData
        if (this.frameCounter >= this.framesPerPathSave) {
          this.calcDataFrame.next(calcData)
        }
        this.savePathsForFrame(orbitData)
        this.solSystemFrame.next(orbitData);
      }
      else {
        console.log("Socket Message : " + JSON.stringify(data))
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.connectionStatus.next(false)
    };


    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.connectionStatus.next(false)
      // Optionally try to reconnect
      // setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  disconnectWebSocket() {
    if (this.socket) {
        this.socket.close();
    }
  }

  savePathsForFrame(data: OrbitBody[]) {
    if (this.frameCounter >= this.framesPerPathSave) {
      this.frameCounter = 0;
      for (let i=0; i < data.length; i++) {
        var oldPaths = this.savedFrame[i].RenderData!.Path!
        if (oldPaths.length < 5000){
          oldPaths.push(data[i].Position)
        }
        else {
          oldPaths.shift()
          oldPaths.push(data[i].Position)
        }
        data[i].RenderData = {...this.savedFrame[i].RenderData!, Path: oldPaths}
      }
    }
    else {
      for (let i=0; i < data.length; i++) {
        data[i].RenderData = this.savedFrame[i].RenderData
      }

    }
    this.savedFrame = data;
  }
}
