package main

import (
	"fmt"
	"log"
	"net/http"
	"solsim/controllers"
)

func main() {
	// you cannot simply use a function or a struct from another file
	// you must specify the package you are importing, there are no namespaces in GO
	http.HandleFunc("PUT /CalculatePaths", controllers.CalculatePaths)

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
