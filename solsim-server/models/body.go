package models

type Body struct {
	Name        string
	Mass        float64
	Radius      float64
	PixelRadius int
	Luminosity  float64
	Color       string
	Position    Position
	Momentum    Momentum
}

type Position struct {
	X float64
	Y float64
	Z float64
}

type Momentum struct {
	Dx float64
	Dy float64
	Dz float64
}

type BodyPath struct {
	Name string
	Path []Position
}

type SolWebSocketData struct {
	CalcData    CalcData
	OrbitBodies []Body
}

type CalcData struct {
	CalcsPerSecond int
	TotalCalcs     int
}
