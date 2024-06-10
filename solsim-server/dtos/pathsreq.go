package dtos

import (
	"solsim/models"
)

type PathsReqDto struct {
	Grainularity int64 // lowest number is 1 second, seems reasonable for, better to multiply an int
	Timeout      int64 // in miliseconds
	MaxSize      int   // in KB, we don't want to return a response that is too big
	Bodies       []models.Body
}

type PathsReqSocketDto struct {
	Grainularity int64 // lowest number is 1 second, seems reasonable for, better to multiply an int
	Bodies       []models.Body
}
