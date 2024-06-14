import { BehaviorSubject } from "rxjs";

export class ControlsService {
    public showPaths: BehaviorSubject<any>;
    public toggleVectors: BehaviorSubject<any>;

    public resetPaths: BehaviorSubject<any>;
    public recenterSubject: BehaviorSubject<any>;

    getShowPathsSubj() {
        return this.showPaths.asObservable;
    }

    constructor() {
        this.showPaths = new BehaviorSubject<any>(false);
    }
}

let cs = new ControlsService()

export default cs