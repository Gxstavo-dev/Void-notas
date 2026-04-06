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

// tipar los datos de Nota { lo de json es para retornarlo en js }
type Nota struct {
	Id             int64  `json:"id"`
	Titulo         string `json:"titulo"`
	Contenido      string `json:"contenido"`
	UltimoGuardado string `json:"ultimoGuardado"`
}

func main() {

	// verificamos si "templates/index.html" es una ruta relativa si es asi almacenamos
	ruta, err := filepath.Abs("templates/index.html")

	if err != nil {
		panic(err) // si es error detiene la app
	}

	w := webview.New(true) // true = debug/DevTools habilitado
	defer w.Destroy()
	w.SetTitle("Void Notas")
	w.SetSize(1200, 700, webview.HintFixed) // evitar resizable

	db, err := sql.Open("sqlite", "./Database/app.db") //  conectarse  a la db

	// error al abrir la db
	if err != nil {
		log.Fatal("Error abriendo DB:", err)
	}

	// error al llamar a la funcion crearTablas
	if err := crearTablas(db); err != nil {
		log.Fatal("Error creando tablas:", err)
	}

	// binding para crear notas la cual tendra como retorno Nota
	w.Bind("crearNota", func(titulo, contenido, ultimoGuardado string) Nota {

		// ejecutar consulta
		query, err := db.Exec(
			"INSERT INTO notas (titulo, contenido, ultimoGuardado) VALUES (?, ?, ?)",
			titulo, contenido, ultimoGuardado,
		)

		if err != nil {
			log.Printf("error al insertar nota: %v", err)
			return Nota{} // retornamos nota vacia
		}
		id, err := query.LastInsertId() // obtener el id de esa nota creada

		if err != nil {
			log.Printf("error obteniendo id: %v", err)
			return Nota{}
		}

		// retornamos todos los datos
		return Nota{
			Id:             id,
			Titulo:         titulo,
			Contenido:      contenido,
			UltimoGuardado: ultimoGuardado,
		}
	})

	// binding para actualizar la nota y retornara true o false
	w.Bind("actualizarNota", func(id int, titulo, contenido, ultimoGuardado string) bool {
		_, err := db.Exec("Update notas SET titulo = ? , contenido = ? , ultimoGuardado = ? WHERE id = ?", titulo, contenido, ultimoGuardado, id)

		if err != nil {
			log.Printf("error al actualizar la nota: %v", err)
			return false // si fall retorna false
		}

		return true
	})

	// binding mostrarnota que solo necesita el id como parametro

	w.Bind("mostrarNota", func(id int) Nota {

		// guardamos la la structuc nota vacia en nueva variable
		nota := Nota{}

		// para leer una fila
		err := db.QueryRow(
			"SELECT id, titulo, contenido, ultimoGuardado FROM notas WHERE id = ?", id,
		).Scan(&nota.Id, &nota.Titulo, &nota.Contenido, &nota.UltimoGuardado)
		// .Scan() mapea cada columna del SELECT a cada campo del struct, en orden

		// si no existe la nota retorna nada
		if err == sql.ErrNoRows {
			log.Printf("nota %d no existe", id)
			return Nota{}
		}

		if err != nil {
			log.Printf("error al mostrar nota id %d: %v", id, err)
			return Nota{}
		}

		return nota // retorna los datos de guardamos en nota del struct Nota
	})

	// binding mostrarnotas para retornar todas las notas de la db
	w.Bind("mostrarNotas", func() []Nota {
		rows, err := db.Query("SELECT id, titulo, contenido, ultimoGuardado FROM notas")

		if err != nil {
			log.Printf("error al listar notas: %v", err)
			return []Nota{}
		}
		defer rows.Close() // cerrar la conexion al terminar la funcion ( uso de defer para no tener que estar cerrando la db  para liberar la memoria)

		notas := []Nota{} // crear un array de la struct notas vacio

		for rows.Next() { // uso de next + for para recorrer cada fila y si existe ese fila
			var n Nota
			// leer los datos de la fila actual
			if err := rows.Scan(&n.Id, &n.Titulo, &n.Contenido, &n.UltimoGuardado); err != nil {
				continue
			}
			notas = append(notas, n) //  crear un slice vacio de Nota
		}
		return notas
	})

	// binding eliminar nota que retorna true o false
	w.Bind("eliminarNota", func(id int64) bool {

		_, err := db.Exec(" DELETE FROM notas WHERE id = ?;", id)

		if err != nil {
			log.Printf("error al eliminar las notas: %v", err)
			return false
		}
		return true
	})

	// para que en linux funcione la ruta utilzar file://
	w.Navigate("file://" + ruta)
	w.Run()
}
