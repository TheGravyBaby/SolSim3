package models

type SolWebSocketReq struct {
	Settings    CalcSettings `json:"Settings"`
	OrbitBodies []Body       `json:"OrbitBodies"`
}

type SolWebSocketResp struct {
	CalcData    CalcData `json:"CalcData"`
	OrbitBodies []Body   `json:"OrbitBodies"`
}
