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
  Mass: number;
  Radius: number;
  Position: Position;
  Momentum: Momentum;
  RenderData: RenderData
}

export interface RenderData {
  Name: string;
  Color: string;
  PixelRadius: number;
  Luminosity: number;
  Path?: Position[];
}

export interface CalculationSettings {
  Granularity: number;
  VerletInt: boolean;
  Collisions: boolean;
}