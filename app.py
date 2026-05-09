import os
import http.server
import socketserver

PORT = int(os.environ.get('PORT', 8080))
DIR  = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)
    def log_message(self, fmt, *args):
        pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

class ReuseTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

print(f'Tower Defense HTML  →  http://localhost:{PORT}')
with ReuseTCPServer(('', PORT), Handler) as httpd:
    httpd.serve_forever()
