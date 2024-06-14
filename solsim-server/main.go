package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"solsim/controllers"
	"solsim/models"
	"solsim/utils"
	"time"

	"github.com/gorilla/websocket"
)

// Upgrade HTTP server connection to WebSocket protocol
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all connections by default
	},
}

func main() {
	// you cannot simply use a function or a struct from another file
	// you must specify the package you are importing, there are no namespaces in GO
	http.HandleFunc("PUT /CalculatePaths", controllers.CalculatePaths)

	// WebSocket endpoint
	http.HandleFunc("/ws", handleWebSocket)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		errorHandler(w, r, http.StatusNotFound)
	})

	fmt.Println("Starting server at port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

}

func errorHandler(w http.ResponseWriter, r *http.Request, status int) {
	w.WriteHeader(status)
	if status == http.StatusNotFound {
		fmt.Fprint(w, "Bad Request 404")
	}
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	log.Print("Establishing socket.")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Failed to upgrade to websocket:", err)
		return
	}
	defer conn.Close()

	_, msg, err := conn.ReadMessage()
	if err != nil {
		log.Println("Error reading message:", err)
	}

	var orbitBodies []models.Body
	err = json.Unmarshal([]byte(msg), &orbitBodies)
	if err != nil {
		log.Println("Error unmarshalling message:", err)
	} else {
		timeout := time.Second * 60
		keepAlive(conn, timeout)
		calculatePathsOnSocket(orbitBodies, conn)

	}

}

func calculatePathsOnSocket(orbitBodies []models.Body, conn *websocket.Conn) {
	var runCalcs = true
	var calcsPerFrame = 0
	var totalCalcs = 0
	var frameRate = 30
	conn.SetCloseHandler(func(code int, text string) error {
		runCalcs = false
		log.Print("Socket Closed")
		return nil
	})
	ticker := time.NewTicker(time.Second / time.Duration(frameRate))
	defer ticker.Stop()
	for runCalcs {
		select {
		case <-ticker.C:

			calcData := models.CalcData{
				CalcsPerSecond: calcsPerFrame * frameRate,
				TotalCalcs:     totalCalcs,
			}
			message := models.SolWebSocketData{
				CalcData:    calcData,
				OrbitBodies: orbitBodies,
			}

			data, err := json.Marshal(message)
			calcsPerFrame = 0
			if err != nil {
				log.Println("Error marshalling orbit bodies:", err)
				return
			}

			if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Println("Error writing message:", err)
				return
			}

		default:
			// Calculate next positions as fast as possible
			err := utils.CalculateNextPosition(orbitBodies)
			calcsPerFrame++
			totalCalcs++

			if err != nil {
				log.Println("Error calculating positions:", err)
				return
			}
		}
	}
}

func keepAlive(c *websocket.Conn, timeout time.Duration) {
	lastResponse := time.Now()
	c.SetPongHandler(func(msg string) error {
		lastResponse = time.Now()
		return nil
	})

	go func() {
		for {
			err := c.WriteMessage(websocket.PingMessage, []byte("keepalive"))
			if err != nil {
				return
			}
			time.Sleep(timeout / 2)
			if time.Since(lastResponse) > timeout {
				c.Close()
				return
			}
		}
	}()
}
