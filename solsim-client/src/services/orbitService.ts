import { BehaviorSubject } from 'rxjs';
import { OrbitBody } from '../models/body';
import { solSystem } from '../systems/new';

class OrbitService {
    private orbitBodiesSubject: BehaviorSubject<OrbitBody[]>;
    private socket: WebSocket;
    private lastFrame: OrbitBody[];
  
    constructor(initialBodies: OrbitBody[]) {
      this.orbitBodiesSubject = new BehaviorSubject<OrbitBody[]>(initialBodies);
      this.connectWebSocket()
      this.getOrbitBodiesObservable().subscribe(newBodies => {
        this.lastFrame = newBodies
      })
    }
  
    getOrbitBodiesObservable() {
      return this.orbitBodiesSubject.asObservable();
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
      this.socket = new WebSocket('ws://localhost:8080/ws');
      this.socket.onopen = () => {
        var data = JSON.stringify(this.orbitBodiesSubject.value ?? initialBodies);
        this.socket.send(data);
      };

      this.socket.onmessage = (event) => {
        let data = JSON.parse(event.data);

        if (Array.isArray(data) && data.length > 0 && data[0].Name) {

          // we don't want to add burden on the server for rendering paths
            for (let i=0; i < data.length; i++) {
              var oldPaths = this.lastFrame[i].Path ?? []
              if (oldPaths.length < 10000)
                oldPaths.push(data[i].Position)
              else {
                oldPaths.shift()
                oldPaths.push(data[i].Position)
              }
              data[i] = {...data[i], Path: oldPaths}
            }

            this.orbitBodiesSubject.next(data);
        }
        else {
            console.log(data)
        }
    };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);

      };


      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        console.log(this.lastFrame)
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

  }
  
  // Example initial data
  const initialBodies = solSystem
  
  const orbitService = new OrbitService(initialBodies);
  
  export default orbitService;