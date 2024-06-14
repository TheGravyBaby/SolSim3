export interface Position {
    X: number;
    Y: number;
    Z: number;
}

export interface Momentum {
  Dx: number;
  Dy: number;
  Dz: number;
}

export interface OrbitBody {
  Name: string;
  Mass: number;
  Radius: number;
  PixelRadius: number;
  Luminosity: number;
  Color: string;
  Position: Position;
  Momentum: Momentum;
  Path?: Position[];
}

export interface SolWebSocketData {
  CalcData: any;
  OrbitBodies: OrbitBody[];
}