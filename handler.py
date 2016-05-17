# -*- coding:utf-8 -*-
__author__ = 'gis1'

import os
import cgi
from cgi import parse_qs, escape

# application 是具体负责业务逻辑的应用程序，接受环境变量和 响应函数两个参数

form = cgi.FieldStorage()
STATIC_URL_PRE = '/'
STATIC_FILE_DIR = '/'
MIME_TABLE = {
    'txt':'text/plain',
    'css':'text/css',
    'html':'text/html',
    'json':'text/json',
    'geojson':'text/json',
    'kml':'text/xml',
    'js':'application/javascript',
    'png':'image/png',
    'jpg':'image/jpg',    
    'tif':'image/tiff'
}


def application(environ, res):
    method = environ['REQUEST_METHOD']
    # path 用来找到相应的应用程序。例如/taxiOD 相应的应用程序是extract_od
    path = environ["PATH_INFO"]
    if method == 'GET' and path.startswith('/'):
        return static_app(environ, res)
    elif method == 'POST' and path.startswith('/cache'):
        return cache_app(environ, res)
    elif method == 'GET' and path.startswith(STATIC_URL_PRE):
        return static_app(environ, res)
    
    else:
        return show_404(environ, res)
    # if method == 'GET' and path == "/taxiOD":
    #    return extract_od(environ, res)
    # if method == 'GET' and path == "/index.html":
    #    return reindex(environ, res)

def cache_app(environ, res):
    # for key in environ:
    #     try:
    #         print key+', '+ str(environ[key])
    #     except Exception, e:
    #         print 'value cant transform to str'
    request_bodysize = int(environ.get('CONTENT_LENGTH',0))
    print 'received post data, length: ' + str(request_bodysize)
    if request_bodysize > 0:
        body = environ['wsgi.input'].read(request_bodysize)
        d = parse_qs(body)
        cachefile = open('cache.json','w')
        jsonstr = d.get('content')[0]
        print type(jsonstr)
        cachefile.write(jsonstr)
        cachefile.close()
    else:
        print 'No Post Body found!!!'

    res("200 OK", [("Content-Type", "text/json")])
    return "{'mes':'Dont know Where is the Body'}"


def content_type(path):
    ext = path.split('.')
    for n in ext:
        mime = n
    if mime in MIME_TABLE:
        return MIME_TABLE[mime]
    else:
        return 'application/octet-stream'

def static_app(environ, res):
    filepath = environ['PATH_INFO'].replace(STATIC_URL_PRE,STATIC_FILE_DIR)
    if filepath.startswith('/'):
        filepath = filepath[1:]
    print 'request filepath is:%s'%(filepath)
    ext = filepath.split('.')
    for n in ext:
        mime = n
    print 'mime is:%s'%(mime)
    try:
        if os.path.exists(filepath) == True:
            res("200 OK", [("Content-Type", content_type(filepath))])
            h = open(filepath, "rb")
            print "open file %s finished"%(filepath)
            content = h.read()
            return [content]
        else:
            res("200 OK", [("Content-Type", "text/html")])
            return "<h1>Sorry, %s!</h1>"%('Not found')
        # elif mime == 'shp'
        #  return "<h1>Hello, %s!</h1>" %(environ or 'web')
    except Exception,e:
        print 'err'


def show_404(environ, res):
    res("200 OK", [("Content-Type", "text/html")])
    return "<h1>Sorry, %s! 404</h1>" %('Not found')