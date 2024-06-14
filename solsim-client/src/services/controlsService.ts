import { BehaviorSubject } from "rxjs";

export class ControlsService {
    private togglePathsSubject: BehaviorSubject<any>;
    private recenterSubject: BehaviorSubject<any>;
    private resetPaths: BehaviorSubject<any>;
    private toggleVectors: BehaviorSubject<any>;
}