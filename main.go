package main

import webview "github.com/webview/webview_go"

func main() {
	w := webview.New(true) // true = debug/DevTools habilitado
	defer w.Destroy()
	w.SetTitle("Mi App")
	w.SetSize(800, 600, webview.HintFixed)
	w.SetHtml("<h1>Hola mundo</h1>")
	w.Run()
}
