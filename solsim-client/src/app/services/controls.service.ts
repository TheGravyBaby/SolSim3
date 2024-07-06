import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { OrbitBody } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ControlsService {
  private recenterSubject = new Subject<void>();
  private togglePathsSubject = new Subject<void>();
  private resetPathsSubject = new Subject<void>();
  private toggleVectorsSubject = new Subject<void>();
  private toggleGridSubject = new Subject<void>();
  private newSolSystem = new Subject<OrbitBody[]>;
  private focusBody = new Subject<string>();


  recenter$ = this.recenterSubject.asObservable();
  togglePaths$ = this.togglePathsSubject.asObservable();
  resetPaths$ = this.resetPathsSubject.asObservable();
  toggleVectors$ = this.toggleVectorsSubject.asObservable();
  toggleGrid$ = this.toggleGridSubject.asObservable();
  newSolSystem$ = this.newSolSystem.asObservable();
  focusBody$ = this.focusBody.asObservable();


  recenter() {
    this.recenterSubject.next();
  }

  togglePaths() {
    this.togglePathsSubject.next();
  }

  resetPaths() {
    this.resetPathsSubject.next();
  }

  toggleVectors() {
    this.toggleVectorsSubject.next();
  }

  toggleGrid() {
    this.toggleGridSubject.next();
  }

  changeSol(system: OrbitBody[]) {
    this.newSolSystem.next(system);
  }

  changeBody(name: string) {
    this.focusBody.next(name);
  }


}