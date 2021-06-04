import flask
from flask import request, jsonify, send_file
import urllib.request
import json
from flask_cors import CORS, cross_origin
from PIL import Image
import io
from base64 import encodebytes
import requests

cors = CORS()

app = flask.Flask(__name__)
app.config["DEBUG"] = True
cors.init_app(app=app, supports_credentials=True)

#for testing to see the camera status
@app.route('/test', methods=['GET'])
def api_get_info():
    urllib.request.urlopen("http://192.168.1.1/osc/info").read()

    res = urllib.request.urlopen('http://192.168.1.1/osc/info')
    returnJson = json.loads(res.read().decode('utf-8'))
    return returnJson

#retrieves the latest photo taken
@app.route('/retrievePicture', methods=['GET'])
def api_retrieve_picture():

    res = urllib.request.urlopen('http://192.168.1.1/osc/state', urllib.parse.urlencode({}).encode('ascii'))
    j = json.loads(res.read().decode('utf-8'))
    fileUrl = j["state"]["_latestFileUrl"]

    print(fileUrl)

    return fileUrl

#sends a request to camera to take a picture
@app.route('/takePicture', methods=['POST'])
def api_take_picture():

    data = json.dumps({"name":"camera.takePicture"}).encode('ascii')
    res = urllib.request.urlopen('http://192.168.1.1/osc/commands/execute', data)
    returnJson = json.loads(res.read().decode('utf-8'))
    
    print('Took a photo')
    print(returnJson)
    return returnJson

#for downloading the file it returns a byte array of the image from url
@app.route('/downloadPhoto', methods=['POST'])
def api_download_photo():
    request_data = request.get_json();
    print(request_data);

    img = Image.open(requests.get(request_data["fileUrl"], stream=True).raw)

    byte_arr = io.BytesIO()
    img.save(byte_arr, format='JPEG')

    byte_arr = byte_arr.getvalue()
    return byte_arr

#lists all the camera files by entry count
@app.route('/listImageFiles', methods=['POST'])
def api_list_image_file():
    request_data = request.get_json();
    print(request_data);

    data = json.dumps({"fileType":"image", "maxThumbSize":0, "entryCount":request_data["entryCount"]}).encode('ascii')
    res = urllib.request.urlopen('http://192.168.1.1/osc/commands/execute', data)
    returnJson = json.loads(res.read().decode('utf-8'))
    print('Retrieving image files')
    print(returnJson)
    return returnJson

#gets the status of the picture to see if it's done taking picture (returns the camera image)
@app.route('/pictureStatus', methods=['POST'])
def api_check_picture_status():
    request_data = request.get_json();
    print(request_data)

    data = json.dumps({"id":request_data["id"]}).encode('ascii')
    res = urllib.request.urlopen('http://192.168.1.1/osc/commands/status', data)
    returnJson = json.loads(res.read().decode('utf-8'))
    print('Checking Status')
    print(returnJson)
    return returnJson

#for error handling of unknown status
@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found.</p>", 404


app.run()