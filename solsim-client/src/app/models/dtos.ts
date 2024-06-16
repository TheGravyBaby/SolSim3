import { CalculationSettings, OrbitBody } from "./models";

export interface SolWebSocketDataRes {
    CalcData: any;
    OrbitBodies: OrbitBody[];
  }
  
  
  export interface SolWebSocketDataReq {
    Settings: CalculationSettings;
    OrbitBodies: OrbitBody[];
  }