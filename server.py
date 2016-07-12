# -*-coding:utf-8 -*-
# server.py

from wsgiref.simple_server import make_server

from handler import application

# 创建服务器，ip地址，处理函数是application
httpd = make_server('', 8080, application)
print ("Serving HTTP on port 8080")

# 开始监听请求
httpd.serve_forever()
# WSGI：Web Server Gateway Interface 类似于CGI

