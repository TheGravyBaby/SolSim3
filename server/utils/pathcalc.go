package utils

import (
	"math"
	"solsim/dtos"
	"solsim/models"
	"time"
)

const GravConst float64 = 6.67408e-11

func CalculatePaths(d dtos.PathsReqDto) ([]models.BodyPath, error) {
	var result []models.BodyPath

	// create a result array with an element for each body
	for i := 0; i < len(d.Bodies); i++ {
		result = append(result, models.BodyPath{Name: d.Bodies[i].Name})
	}

	startTime := time.Now()
	for time.Since(startTime).Milliseconds() < d.Timeout {

		// Calculate the forces on each body
		allForces := sumForces(d.Bodies)

		// Now apply those forces on the body, update the positions
		for i := 0; i < len(d.Bodies); i++ {
			updatePosition(allForces[i]["Fx"], allForces[i]["Fy"], allForces[i]["Fz"], &d.Bodies[i], float64(d.Grainularity))
			result[i].Path = append(result[i].Path, d.Bodies[i].Position)
		}

		// Check if the loop time exceeds the timeout
		if time.Since(startTime).Milliseconds() >= d.Timeout {
			break
		}
	}

	return result, nil
}

func sumForces(bodyArray []models.Body) []map[string]float64 {
	universalForceArray := []map[string]float64{}

	// TODO : this loop is the one to make multithreaded
	// each body can have its own thread calculating the forces
	for i := 0; i < len(bodyArray); i++ {
		Fx := 0.0
		Fy := 0.0
		Fz := 0.0

		for j := 0; j < len(bodyArray); j++ {
			if i != j {
				force := calculateForce(bodyArray[i], bodyArray[j])
				Fx += force[0]
				Fy += force[1]
				Fz += force[2]
			}
		}

		// TODO : We really shouldn't waste memory with this dictionary crap
		forceMap := map[string]float64{
			"Fx": Fx,
			"Fy": Fy,
			"Fz": Fz,
		}
		universalForceArray = append(universalForceArray, forceMap)
	}

	return universalForceArray
}

func updatePosition(Fx, Fy, Fz float64, body *models.Body, dt float64) {

	// This is a very crude implementation of special relativity
	// It prevents bodies from moving too fast
	// Leaving out for now, as I want to implement collisions
	// velocityMag := math.Pow((body.Dx*body.Dx + body.Dy*body.Dy + body.Dz*body.Dz), 0.5)
	// relativeMass := body.Mass / math.Pow((1 - (velocityMag*velocityMag/(8.98755179*math.Pow(10, 16)))), 0.5)
	// ddx := Fx / relativeMass
	// ddy := Fy / relativeMass
	// ddz := Fz / relativeMass

	// These don't take into account relativity
	ddx := Fx / body.Mass
	ddy := Fy / body.Mass
	ddz := Fz / body.Mass

	body.Position.X = body.Position.X + body.Momentum.Dx*dt + 0.5*ddx*math.Pow(dt, 2)
	body.Position.Y = body.Position.Y + body.Momentum.Dy*dt + 0.5*ddy*math.Pow(dt, 2)
	body.Position.Z = body.Position.Z + body.Momentum.Dz*dt + 0.5*ddz*math.Pow(dt, 2)

	// Find the new velocity at this new position
	body.Momentum.Dx = body.Momentum.Dx + ddx*dt
	body.Momentum.Dy = body.Momentum.Dy + ddy*dt
	body.Momentum.Dz = body.Momentum.Dz + ddz*dt
}

func calculateForce(body1, body2 models.Body) [3]float64 {

	xdif := body2.Position.X - body1.Position.X
	ydif := body2.Position.Y - body1.Position.Y
	zdif := body2.Position.Z - body1.Position.Z

	distance2d := math.Pow(math.Pow(xdif, 2)+math.Pow(ydif, 2), 0.5)
	distance := math.Pow(math.Pow(xdif, 2)+math.Pow(ydif, 2)+math.Pow(zdif, 2), 0.5)

	theta := math.Atan2(ydif, xdif)
	phi := math.Atan2(zdif, distance2d)

	Fmag := body1.Mass * body2.Mass * GravConst / (distance * distance)
	Fx := Fmag * math.Cos(theta)
	Fy := Fmag * math.Sin(theta)
	Fz := Fmag * math.Sin(phi)

	return [3]float64{Fx, Fy, Fz}
}
