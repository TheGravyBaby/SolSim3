package controllers

import (
	"encoding/json"
	"net/http"
	"solsim/dtos"
	"solsim/utils"
)

func CalculatePaths(w http.ResponseWriter, r *http.Request) {

	// Parse the request body into a CalculatePathsDto object
	var dto dtos.PathsReqDto

	err := json.NewDecoder(r.Body).Decode(&dto)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Perform calculations using the CalculatePathsDto object
	result, err := utils.CalculatePaths(dto)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Convert the result to JSON
	response, err := json.Marshal(dtos.NewPathsRespDto(result))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}
