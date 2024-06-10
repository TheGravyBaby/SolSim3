import { BehaviorSubject } from 'rxjs';
import { OrbitBody } from '../models/body';
import { solSystem } from '../systems/new';

class OrbitService {
    private orbitBodiesSubject: BehaviorSubject<OrbitBody[]>;
    private socket: WebSocket;
  
    constructor(initialBodies: OrbitBody[]) {
      this.orbitBodiesSubject = new BehaviorSubject<OrbitBody[]>(initialBodies);
      this.connectWebSocket()
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
        console.log('WebSocket connection established');
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.orbitBodiesSubject.next(data);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        // Optionally try to reconnect
        //setTimeout(() => this.connectWebSocket(), 5000);
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