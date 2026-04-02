import webview
from Api.Api import Api

api = Api()

app = webview.create_window(
    title="Void Notas",
    width=1200,
    height=700,
    url="src/index.html",
    resizable=False,
    js_api=api,
)
webview.start(debug=True)
