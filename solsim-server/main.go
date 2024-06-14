package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"solsim/controllers"
	"solsim/models"
	"solsim/utils"
	"sync"
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
	http.HandleFunc("/solsim/ws", solSimSocket)

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

func solSimSocket(w http.ResponseWriter, r *http.Request) {
	log.Print("Establishing socket...")
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

	// try to parse message, assign to proper method
	var orbitBodies []models.Body
	err = json.Unmarshal([]byte(msg), &orbitBodies)
	if err != nil {
		log.Println("Error unmarshalling message:", err)
	} else {
		log.Print("Begining Path Calc Routine...")
		calculatePathsOnSocket(orbitBodies, conn)
	}
}

func calculatePathsOnSocket(orbitBodies []models.Body, conn *websocket.Conn) (err error) {
	var runCalcs = true
	var calcsPerFrame = 0
	var totalCalcs = 0
	var frameRate = 60
	var timeoutInSec = 300

	ticker := time.NewTicker(time.Second / time.Duration(frameRate))
	defer ticker.Stop()

	sendChan := make(chan models.SolWebSocketData)
	endChan := make(chan struct{})
	var mu sync.Mutex

	conn.SetCloseHandler(func(code int, text string) error {
		mu.Lock()
		runCalcs = false
		mu.Unlock()
		time.Sleep(1 * time.Second) // Optional: to ensure all goroutines exit cleanly
		log.Println("Client Closed...")
		conn.Close()
		close(endChan)
		return nil
	})

	// Handle Messages
	go handleMessages(conn)

	// Calculation Paths
	go func() {
		for runCalcs {
			err := utils.CalculateNextPosition(orbitBodies, 60)
			if err != nil {
				log.Println("Error calculating positions:", err)
				mu.Lock()
				runCalcs = false
				mu.Unlock()
				conn.Close()
				close(endChan) // Signal that the process has ended due to error
				return
			}

			mu.Lock()
			calcsPerFrame++
			totalCalcs++
			mu.Unlock()
		}
	}()

	// Calculate Metrics
	go func() {
		for runCalcs {
			select {
			case <-ticker.C: // ticker.C stands for channel in this case, yay go syntax!
				calcData := models.CalcData{
					CalcsPerSecond: calcsPerFrame * frameRate,
					TotalCalcs:     totalCalcs,
				}
				message := models.SolWebSocketData{
					CalcData:    calcData,
					OrbitBodies: orbitBodies,
				}
				calcsPerFrame = 0

				sendChan <- message
			}
		}
	}()

	// Send data over websocket
	go func() {
		for runCalcs {
			select {
			// notice this doesn't care about time
			// it only responds when the send channel sends a message
			case message := <-sendChan:
				data, err := json.Marshal(message)
				if err != nil {
					log.Println("Error marshalling orbit bodies:", err)
					mu.Lock()
					runCalcs = false
					mu.Unlock()
					conn.Close()
					close(endChan) // Signal that the process has ended due to error
					return
				}

				if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
					log.Println("Error writing message:", err)
					mu.Lock()
					runCalcs = false
					mu.Unlock()
					conn.Close()
					close(endChan) // Signal that the process has ended due to error
					return
				}
			}
		}
	}()

	// Timeout logic
	go func() {
		for runCalcs {
			select {
			case <-time.After(time.Second * time.Duration(timeoutInSec)):
				log.Println("Timeout Hit. Closing socket...")
				mu.Lock()
				runCalcs = false
				mu.Unlock()
				time.Sleep(1 * time.Second) // Optional: to ensure all goroutines exit cleanly
				conn.Close()
				close(endChan) // Signal that the process has ended
				return
			case <-endChan:
				return
			}
		}
	}()

	// the parent function cannot return until endChan
	// all these routines will keep spinning in their for loops
	<-endChan
	conn.Close()
	return nil
}

func handleMessages(conn *websocket.Conn) {
	for {
		messageType, r, err := conn.NextReader()
		if err != nil {
			log.Println("Error reading message:", err)
			break
		}

		// Process the message based on its type
		if messageType == websocket.TextMessage {
			message, err := io.ReadAll(r)
			if err != nil {
				log.Println("Error reading message payload:", err)
				continue
			}

			log.Printf("Received message: %s", message)
			// Echo the message back to the client
			if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Println("Error writing message:", err)
				break
			}
		}
	}
}
