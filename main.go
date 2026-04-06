package main

// importar drive de sql para utilizar sqlite
// path para verificar si existe la direccion del index.html
// webview para crear la ventana

import (
	"database/sql"
	"log"
	"path/filepath"

	webview "github.com/webview/webview_go"
	_ "modernc.org/sqlite"
)

// funcion para crear la tabla apenas iniciar la app
func crearTablas(db *sql.DB) error {

	_, err := db.Exec(`
			CREATE TABLE IF NOT EXISTS notas(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT,
            contenido TEXT,
            ultimoGuardado TEXT
            );
	`)
	return err // retorna el error si no funciona

}

func crearNota(db *sql.DB) {

}
func actualizarNota(db *sql.DB) {

}
func mostrarNota(db *sql.DB) {

}
func mostrarNotas(db *sql.DB) {

}
func eliminarNota(db *sql.DB) {

}

func main() {

	// verificamos si "templates/index.html" es una ruta relativa si es asi almacenamos
	ruta, err := filepath.Abs("templates/index.html")
	// si es error detiene la app
	if err != nil {
		panic(err)
	}

	w := webview.New(true) // true = debug/DevTools habilitado
	defer w.Destroy()
	w.SetTitle("Void Notas")
	w.SetSize(1200, 700, webview.HintFixed) // evitar resizable

	db, err := sql.Open("sqlite", "./Database/app.db")

	// error al abrir la db
	if err != nil {
		log.Fatal("Error abriendo DB:", err)
	}

	// error al llamar a la funcion crearTablas
	if err := crearTablas(db); err != nil {
		log.Fatal("Error creando tablas:", err)
	}

	w.Bind("crearNota", crearNota(db))
	w.Bind("actualizarNota", actualizarNota(db))
	w.Bind("mostrarNota", mostrarNota(db))
	w.Bind("mostrarNotas", mostrarNotas(db))
	w.Bind("eliminarNota", eliminarNota(db))

	// para que en linux funcione la ruta utilzar file://
	w.Navigate("file://" + ruta)
	w.Run()
}
