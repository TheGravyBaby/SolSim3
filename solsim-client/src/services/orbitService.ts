import { BehaviorSubject } from 'rxjs';
import { OrbitBody } from '../models/body';
import { solSystem } from '../systems/new';

// considering the amount of data that has to be moved around
// and transformations that will be applied to it, I feel like
// it's best to go with rxjs for moving orbit data between components
// perhaps context API could handle this but I'll leave that for user controls
class OrbitService {
  private orbitBodiesSubject: BehaviorSubject<OrbitBody[]>;
  private calcDataSubject: BehaviorSubject<any>;
  private isRunning: BehaviorSubject<any>;

  private socket: WebSocket;
  private savedFrame: OrbitBody[];
  private frameCounter: number = 0;
  private framesPerPathSave = 6; 

  constructor(initialBodies: OrbitBody[]) {
    this.orbitBodiesSubject = new BehaviorSubject<OrbitBody[]>(initialBodies);
    this.calcDataSubject =  new BehaviorSubject<any>({CalcsPerFrame: 0});
    this.isRunning =  new BehaviorSubject<boolean>(false);
  }

  getOrbitBodiesObservable() {
    return this.orbitBodiesSubject.asObservable();
  }

  getCalcDataObservable() {
    return this.calcDataSubject.asObservable();
  }

  getIsRunningObservable() {
    return this.isRunning.asObservable();
  }

  updateOrbitBody(name: string, newBody: Partial<OrbitBody>) {
    const currentBodies = this.orbitBodiesSubject.getValue();
    const updatedBodies = currentBodies.map(body =>
      body.Name === name ? { ...body, ...newBody } : body
    );
    this.orbitBodiesSubject.next(updatedBodies);
  }

  addOrbitBody(newBody: OrbitBody) {
    const currentBodies = this.orbitBodiesSubject.getValue();
    this.orbitBodiesSubject.next([...currentBodies, newBody]);
  }

  removeOrbitBody(name: string) {
    const currentBodies = this.orbitBodiesSubject.getValue();
    const updatedBodies = currentBodies.filter(body => body.Name !== name);
    this.orbitBodiesSubject.next(updatedBodies);
  }

  connectWebSocket() {
    this.socket = new WebSocket('ws://localhost:8080/solsim/ws');
    this.socket.onopen = () => {
      console.log("Connecting to socket...")
      var data = JSON.stringify(this.orbitBodiesSubject.value ??initialBodies);
      this.savedFrame =  this.savedFrame ?? initialBodies
      this.socket.send(data);
    };

    this.socket.onmessage = (event) => {
      let data = JSON.parse(event.data)

      // determine if this is a body of path data, which is quite large
      // and will gunk up the logs
      if (data.OrbitBodies && data.CalcData) {
        this.frameCounter++
        var orbitData = data.OrbitBodies
        var calcData = data.CalcData
        if (this.frameCounter >= this.framesPerPathSave) 
          this.calcDataSubject.next(calcData)
        this.savePathsForFrame(orbitData)
        this.orbitBodiesSubject.next(orbitData);
      }
      else {
        console.log("Socket Message : " + data)
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isRunning.next(false)
    };


    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.isRunning.next(false)
      // Optionally try to reconnect
      // setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  disconnectWebSocket() {
    if (this.socket) {
        this.socket.close();
        this.socket = null;
    }
  }

  
  savePathsForFrame(data: OrbitBody[]) {
    if (this.frameCounter >= this.framesPerPathSave) {
      this.frameCounter = 0;
      for (let i=0; i < data.length; i++) {
        var oldPaths = this.savedFrame[i].Path
        if (oldPaths.length < 5000){
          oldPaths.push(data[i].Position)
        }
        else {
          oldPaths.shift()
          oldPaths.push(data[i].Position)
        }
        data[i] = {...data[i], Path: oldPaths}
      }
    }
    else {
      for (let i=0; i < data.length; i++) {
        var oldPaths = this.savedFrame[i].Path
        data[i] = {...data[i], Path: oldPaths}
      }
    }
    this.savedFrame = data;
  }
}
  // Example initial data
const initialBodies = solSystem

const orbitService = new OrbitService(initialBodies);

export default orbitService;