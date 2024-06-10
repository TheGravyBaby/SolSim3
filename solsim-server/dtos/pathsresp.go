package dtos

import (
	"solsim/models"
)

type PathsRespDto struct {
	TotalSegments int
	Paths         []models.BodyPath
}

// use this method to update metadata in the struct
// looks much like a constructor eh?
func NewPathsRespDto(paths []models.BodyPath) *PathsRespDto {
	return &PathsRespDto{
		TotalSegments: len(paths[0].Path),
		Paths:         paths,
	}
}

type PathsResSocketDto struct {
	Bodies []models.Body
}
