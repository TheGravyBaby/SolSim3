package utils

import (
	"math"
	"solsim/models"
	"sync"
)

const GravConst float64 = 6.67408e-11

func CalculateNextPosition(d []models.Body, granularity float64) error {
	// Calculate the forces on each body
	allForces := sumForces(d)

	// Use a WaitGroup to wait for all goroutines to complete
	var wg sync.WaitGroup

	// Now apply those forces on the body, update the positions
	for i := 0; i < len(d); i++ {
		wg.Add(1)
		go func(i int) {
			updatePosition(allForces[i]["Fx"], allForces[i]["Fy"], allForces[i]["Fz"], &d[i], granularity)
			wg.Done()
		}(i)
	}

	// Wait for all goroutines to complete
	wg.Wait()

	return nil
}

func sumForces(bodyArray []models.Body) []map[string]float64 {
	universalForceArray := make([]map[string]float64, len(bodyArray))
	var wg sync.WaitGroup

	for i := 0; i < len(bodyArray); i++ {
		wg.Add(1)
		go func(i int) {
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

			forceMap := map[string]float64{
				"Fx": Fx,
				"Fy": Fy,
				"Fz": Fz,
			}

			universalForceArray[i] = forceMap

			wg.Done()
		}(i)
	}

	wg.Wait()
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

	// Precompute dt and dt^2
	halfDt2 := dt * dt * .5

	// Update positions using precomputed values
	body.Position.X += body.Momentum.Dx*dt + ddx*halfDt2
	body.Position.Y += body.Momentum.Dy*dt + ddy*halfDt2
	body.Position.Z += body.Momentum.Dz*dt + ddz*halfDt2

	// Update velocities
	body.Momentum.Dx += ddx * dt
	body.Momentum.Dy += ddy * dt
	body.Momentum.Dz += ddz * dt
}

func calculateForce(body1, body2 models.Body) [3]float64 {

	xdif := body2.Position.X - body1.Position.X
	ydif := body2.Position.Y - body1.Position.Y
	zdif := body2.Position.Z - body1.Position.Z

	distance2d := math.Sqrt(xdif*xdif + ydif*ydif)
	distance := math.Sqrt(xdif*xdif + ydif*ydif + zdif*zdif)

	theta := math.Atan2(ydif, xdif)
	phi := math.Atan2(zdif, distance2d)

	Fmag := body1.Mass * body2.Mass * GravConst / (distance * distance)
	Fx := Fmag * math.Cos(theta)
	Fy := Fmag * math.Sin(theta)
	Fz := Fmag * math.Sin(phi)

	return [3]float64{Fx, Fy, Fz}
}
