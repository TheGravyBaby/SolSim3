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
	log.Print("Establishing socket with: " + r.URL.Path)
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Failed to upgrade to websocket:", err)
		return
	}
	defer conn.Close()

	go pingPongHandler(conn) // is this concurrency?

	_, msg, err := conn.ReadMessage()
	if err != nil {
		log.Println("Error reading message:", err)
	}

	var orbitBodies []models.Body
	err = json.Unmarshal([]byte(msg), &orbitBodies)
	if err != nil {
		log.Println("Error unmarshalling message:", err)
	}

	// Start a ticker to send updates
	var calcs int = 0
	ticker := time.NewTicker(time.Second / 30)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			// Only send the latest positions every 24th of a second
			data, err := json.Marshal(orbitBodies)
			if err != nil {
				log.Println("Error marshalling orbit bodies:", err)
				continue
			}

			if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Println("Error writing message:", err)
				return
			}

			//log.Print("Calcs Per Frame: " + strconv.Itoa(calcs))
			//calcs = 0
		default:
			// Calculate next positions as fast as possible
			err = utils.CalculateNextPosition(orbitBodies)
			calcs++

			if err != nil {
				log.Println("Error calculating positions:", err)
				return
			}

		}
	}

}

// https://github.com/gorilla/websocket/issues/708
func pingPongHandler(conn *websocket.Conn) {
	// pingWait := 10 * time.Second
	// pongWait := 10 * time.Second
	// conn.SetReadDeadline(time.Now().Add(pingWait))

	// defer func() {
	// 	log.Print("Closing...")
	// 	conn.Close()
	// 	// some other stuff to do
	// }()
	// for {
	// 	log.Print("Looping Looking For Ping...")
	// 	_, p, err := conn.ReadMessage()
	// 	if err != nil {
	// 		fmt.Println(err)
	// 		break
	// 	}
	// 	message := string(p)
	// 	if message == "PING" {
	// 		conn.SetReadDeadline(time.Now().Add(pongWait))
	// 		conn.WriteJSON(("PONG"))
	// 	}
	// 	if message == "PONG" {
	// 		conn.SetReadDeadline(time.Now().Add(pongWait))
	// 		conn.WriteJSON(("PING"))
	// 	}
	//}
}
