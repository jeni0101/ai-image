#!/usr/bin/env python3
"""开发用静态服务器：对所有响应加禁缓存头，避免浏览器缓存旧的 app.js/css/图片。
用法：python3 scripts/serve.py [port]   默认 8123，绑定 0.0.0.0（公网 IP 可访问）。"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    print(f"serving (no-cache) on 0.0.0.0:{PORT}")
    ThreadingHTTPServer(("0.0.0.0", PORT), NoCacheHandler).serve_forever()
