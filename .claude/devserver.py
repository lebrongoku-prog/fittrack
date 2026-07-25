"""Lokaler Test-Server für FitTrack.

Wie `python3 -m http.server`, schickt aber `Cache-Control: no-store` mit — sonst liefert der
Browser beim Prüfen einer Änderung weiter die alte app.js aus. Nur zum Entwickeln gedacht;
für das Deployment auf GitHub Pages ist er nicht beteiligt.
"""
import http.server
import socketserver

PORT = 8123


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"FitTrack dev server on http://localhost:{PORT}")
        httpd.serve_forever()
