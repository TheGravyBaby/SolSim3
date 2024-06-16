package models

type Position struct {
	X float64 `json:"X"`
	Y float64 `json:"Y"`
	Z float64 `json:"Z"`
}

type Momentum struct {
	Dx float64 `json:"Dx"`
	Dy float64 `json:"Dy"`
	Dz float64 `json:"Dz"`
}

type RenderData struct {
	Name        string     `json:"Name"`
	Color       string     `json:"Color"`
	PixelRadius int        `json:"PixelRadius"`
	Luminosity  int        `json:"Luminosity"`
	Path        []Position `json:"Path"`
}

type Body struct {
	Mass       float64    `json:"Mass"`
	Radius     float64    `json:"Radius"`
	Position   Position   `json:"Position"`
	Momentum   Momentum   `json:"Momentum"`
	RenderData RenderData `json:"RenderData"`
}

type CalcSettings struct {
	Granularity int  `json:"Granularity"`
	VerletInt   bool `json:"VerletInt"`
	Collisions  bool `json:"Collisions"`
}

type CalcData struct {
	CalcsPerSecond int `json:"CalcsPerSecond"`
	TotalCalcs     int `json:"TotalCalcs"`
}
