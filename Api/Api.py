import sqlite3


# clase para usarla en main.py como objeto js_api
class Api:

    # iniciar creando la conexion
    def __init__(self):
        # en produccion cambiar a aplicacion.db
        self.conn = sqlite3.connect("Database/test.db",check_same_thread=False)
        # despues de que se crea la conexion creamos la tabla
        self.crearTablas()

    # creamos la tabla con la que trabajaremos en la app
    def crearTablas(self):
        try:
            query = """
            CREATE TABLE IF NOT EXISTS notas(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT,
                contenido TEXT,
                ultimoGuardado TEXT
            );
            """
            self.conn.execute(query)
            self.conn.commit()
        except sqlite3.Error as err:
            print("Ocurrio un error: ", err)

    # funcion para crear notas
    def crearNota(self, titulo, contenido, ultimoGuardado):
        try:
            query = """
                INSERT INTO notas(titulo,contenido,ultimoGuardado) VALUES(?,?,?);
            """
            id = self.conn.execute(query, (titulo, contenido, ultimoGuardado))
            self.conn.commit()
            # retornamos el ultimo id que creo
            return id.lastrowid
        except sqlite3.Error as err:
            print("Ocurrio un error: ", err)

    # funcion para actualizar la nota en la que esta
    def actualizarNota(self, id, titulo, contenido, ultimoGuardado):
        try:
            query = """
                Update notas SET titulo = ? , contenido = ? , ultimoGuardado = ? WHERE id = ?;
            """
            self.conn.execute(query, (id, titulo, contenido, ultimoGuardado))
            self.conn.commit()
        except sqlite3.Error as err:
            print("Ocurrio un error: ", err)

    # funcion solo para mostrar una nota que es la actual al momento de clickear
    # y tambien servira para mostrarlo en preview
    def mostrarNota(self, id):
        try:
            query = """
            SELECT * FROM notas WHERE id = ?;
            """
            fila = self.conn.execute(query, (id))
            self.conn.commit()
            return fila.fetchone()
        except sqlite3.Error as err:
            print("Ocurrio un error: ", err)

    # funcion para mostrar todas las notas en inicio
    def mostrarNotas(self):
        try:
            query = """
            SELECT * FROM notas;
            """
            filas = self.conn.execute(query)
            self.conn.commit()
            return filas.fetchall()
        except sqlite3.Error as err:
            print("Ocurrio un error: ", err)
