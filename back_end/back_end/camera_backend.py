import flask
from flask import request, jsonify, send_file
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin
import urllib.request
import ntpath
from pathlib import Path
import json
from PIL import Image
import io
from base64 import encodebytes
import requests
from os import getcwd # only import "getcwd" from os
import os
from werkzeug.utils import secure_filename

cors = CORS()

app = flask.Flask(__name__)
app.config["DEBUG"] = True
cors.init_app(app=app, supports_credentials=True)
#app.config['UPLOAD_FOLDER'] = getcwd() + "/uploaded_assets/" # Get the current working directory
app.config['UPLOAD_FOLDER'] = getcwd() + "/../front_end/public/uploaded_assets/"

# MYSQL Setup
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'school_map'

mysql = MySQL(app)

#for testing to see the camera status
@app.route('/test', methods=['GET'])
def api_get_info():
    urllib.request.urlopen("http://192.168.1.1/osc/info").read()

    res = urllib.request.urlopen('http://192.168.1.1/osc/info')
    returnJson = json.loads(res.read().decode('utf-8'))

    label = 1
    lat = 500.432
    lng = 400.683
    picture = ""
    image_markers_id = None

    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO markers(label, lat, lng, picture, image_markers_id) VALUES (%s, %s, %s, %s, %s)", (label, lat, lng, picture, image_markers_id))
    mysql.connection.commit()
    cur.close()
    print("success")

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

#accepts a options parameter and calls the setoptions on the camera api
@app.route('/getOptions', methods=['POST'])
def api_get_options():
    request_data = request.get_json();
    print(request_data);
    data = json.dumps({"name":"camera.getOptions", "parameters": {"optionNames": request_data["optionNames"]}}).encode('ascii')
    res = urllib.request.urlopen('http://192.168.1.1/osc/commands/execute', data)
    returnJson = json.loads(res.read().decode('utf-8'))

    print(returnJson)
    return returnJson


#accepts a options parameter and calls the setoptions on the camera api
@app.route('/setOptions', methods=['POST'])
def api_set_options():
    request_data = request.get_json();
    print(request_data);
    data = json.dumps({"name":"camera.setOptions", "parameters": {"options": request_data["options"]}}).encode('ascii')
    res = urllib.request.urlopen('http://192.168.1.1/osc/commands/execute', data)
    returnJson = json.loads(res.read().decode('utf-8'))

    print(returnJson)
    return returnJson

#accepts a json and sets all the database items to the json set
@app.route('/save', methods=['POST'])
def api_save():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM image_markers")
    cur.execute("DELETE FROM markers")

    #inserting marker array
    for marker in request_data:
        label = marker["label"]
        lat = marker["lat"]
        lng = marker["lng"]
        picture = marker["picture"]
        
        cur.execute("INSERT INTO markers(label, lat, lng, picture) VALUES (%s, %s, %s, %s)", (label, lat, lng, picture))

        #inserting image_marker array
        for image_marker in marker["pictureMarkers"]:
            marker_label = marker["label"]
            label = image_marker["label"]
            lat = image_marker["lat"]
            lng = image_marker["lng"]
            picture = image_marker["picture"]

            cur.execute("INSERT INTO image_markers(marker_label, label, lat, lng, picture) VALUES (%s, %s, %s, %s, %s)", (marker_label, label, lat, lng, picture))

    for line_segment in request_data["line_segments"]:
        pt1 = request_data["pt1"]
        pt2 = request_data["pt2"]
        coord1_lat = request_data["coord"][0][0]
        coord1_lng = request_data["coord"][0][1]
        coord2_lat = request_data["coord"][1][0]
        coord2_lng = request_data["coord"][1][1]

        cur.execute("INSERT INTO line_segments(pt1, pt2, coord1_lat, coord1_lng, coord2_lat, coord2_lng) VALUES (%s, %s, %s, %s, %s, %s)", (pt1, pt2, coord1_lat, coord1_lng, coord2_lat, coord2_lng))

    mysql.connection.commit()
    cur.close()

    return "completed"

#clears the entire database
@app.route('/clear', methods=['POST'])
def api_clear():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM line_segments")

    #delete all image_marker images
    cur.execute("SELECT picture from image_markers")

    #run through image markers
    for row in cur: 
        if row[0]:
            os.remove(picture)

    cur.execute("DELETE FROM image_markers")

    #delete all marker images
    cur.execute("SELECT picture from markers")

    #run through markers
    for row in cur: 
        if row[0]:
            os.remove(picture)

    cur.execute("DELETE FROM markers")

    #revert map
    #cur.execute("UPDATE map_settings SET map_image='' map_width, map_height")

    mysql.connection.commit()
    cur.close()

    return "completed"

#retrieves from the markers and image_markers table
@app.route('/load', methods=['GET'])
def api_load():

    cur = mysql.connection.cursor()

    cur.execute("SELECT label, lat, lng, picture from markers")

    markers = []
    marker_label_arr = []

    #run through markers
    for row in cur:
        print(row)
        temp_marker_obj = {
            "label": row[0],
            "lat": row[1],
            "lng": row[2],
            "picture": row[3],
            "pictureMarkers": []
        }
        markers.append(temp_marker_obj)
        marker_label_arr.append(row[0])

    print(markers)

    image_marker_query = "SELECT label, lat, lng, picture, marker_label from image_markers"
    cur.execute(image_marker_query)

    #run through image markers
    for row in cur: 
        temp_marker_obj = {
            "label": row[0],
            "lat": row[1],
            "lng": row[2],
            "picture": row[3],
        }

        marker_index = marker_label_arr.index(row[4])
        markers[marker_index]["pictureMarkers"].append(temp_marker_obj)

    print(markers)

    #load line segments
    cur.execute("SELECT pt1, pt2, coord1_lat, coord1_lng, coord2_lat, coord2_lng from line_segments")

    line_segments = []

    for row in cur:
        print(row)
        temp_line_obj = {
            "pt1": row[0],
            "pt2": row[1],
            "coord": [[row[2], row[3]], [row[4], row[5]]],
        }
        line_segments.append(temp_line_obj)

    print(line_segments)

    #load map    
    # cur.execute("SELECT map_image, map_height, map_width from map_settings LIMIT 1")

    # temp_map_obj = { 
    #     "mapImageURL": cur[0][0],
    #     "mapBounds": [cur[0][1], cur[0][2]]
    # }
    # mysql.connection.commit()
    # cur.close()

    #create final json and return it
    final_json = {}
    final_json["markers"] = markers
    final_json["line_segments"] = line_segments
    #final_json["map_settings"] = temp_map_obj

    return json.dumps(final_json)

#update marker by new one
@app.route('/updateMap', methods=['POST'])
def api_update_map():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()

    map_image = request_data["map_image"]
    map_height = request_data["map_height"]
    map_width = request_data["map_width"]

    cur.execute("UPDATE map_settings SET map_image = %s, map_height = %s, map_width = %s LIMIT 1 , (lat, lng, picture, label)")

    mysql.connection.commit()
    cur.close()

    return "Update Map: " + str(map_image) + " h: " + str(map_height) + " lng: " + str(map_width) 

#adds a new marker
@app.route('/addMarker', methods=['POST'])
def api_add_marker():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()

    label = request_data["label"]
    lat = request_data["lat"]
    lng = request_data["lng"]
    picture = ""

    cur.execute("INSERT INTO markers(label, lat, lng, picture) VALUES (%s, %s, %s, %s)", (label, lat, lng, picture))

    mysql.connection.commit()
    cur.close()

    return "Inserted Marker with: label: " + str(label) + " lat: " + str(lat) + " lng: " + str(lng) + " picture: " + str(picture)

#update marker by new one
@app.route('/updateMarker', methods=['POST'])
def api_update_marker():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()
    print("Hello")
    label = request_data["label"]
    lat = request_data["lat"]
    lng = request_data["lng"]
    picture = request_data["picture"]

    cur.execute("UPDATE markers SET lat = %s, lng = %s, picture = %s WHERE label = %s" , (lat, lng, picture, label))
    print("Almost there")
    mysql.connection.commit()
    cur.close()

    return "Update Marker with: label: " + str(label) + " lat: " + str(lat) + " lng: " + str(lng) + " picture: " + str(picture)

#delete marker by label
@app.route('/deleteMarker', methods=['POST'])
def api_delete_marker():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()

    label = request_data["label"]
    picture = request_data["picture"]

    #remove the picture from the folders directory
    if picture:
        os.remove(picture)

    #remove all the image_markers that belong to this marker
    cur.execute("DELETE FROM image_markers WHERE marker_label = %s", (label,))

    #remove the marker from the database
    cur.execute("DELETE FROM markers WHERE label = %s", (label,))

    mysql.connection.commit()
    cur.close()

    return "Delete Marker with: label: " + str(label)

#adds a new image marker
@app.route('/addImageMarker', methods=['POST'])
def api_add_image_marker():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()

    marker_label = request_data["marker_label"]
    label = request_data["label"]
    lat = request_data["lat"]
    lng = request_data["lng"]
    picture = request_data["picture"]

    cur.execute("INSERT INTO image_markers(marker_label, label, lat, lng, picture) VALUES (%s, %s, %s, %s, %s)", (marker_label, label, lat, lng, picture))

    mysql.connection.commit()
    cur.close()

    return "Inserted Marker with: label: " + str(label) + " lat: " + str(lat) + " lng: " + str(lng) + " picture: " + str(picture)

#update image marker by new one
@app.route('/updateImageMarker', methods=['POST'])
def api_update_image_marker():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()
    
    marker_label = request_data["marker_label"]
    label = request_data["label"]
    lat = request_data["lat"]
    lng = request_data["lng"]
    picture = request_data["picture"]

    cur.execute("UPDATE image_markers SET lat = %s, lng = %s, picture = %s WHERE marker_label = %s AND label = %s" , (lat, lng, picture, marker_label, label))
    
    mysql.connection.commit()
    cur.close()

    return "Update Image Marker with: label: " + str(label) + " lat: " + str(lat) + " lng: " + str(lng) + " picture: " + str(picture)

#delete marker by label
@app.route('/deleteImageMarker', methods=['POST'])
def api_delete_image_marker():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()

    label = request_data["label"]
    marker_label = request_data["marker_label"]
    picture = request_data["picture"]

    #remove the picture from the folders directory
    if picture:
        os.remove(picture)

    #remove the marker from the database
    cur.execute("DELETE FROM image_markers WHERE label = %s AND marker_label = %s", (label, marker_label))

    mysql.connection.commit()
    cur.close()

    return "Delete Marker with: label: " + str(label)

#adds a new line segment
@app.route('/addLineSegment', methods=['POST'])
def api_add_line_segment():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()

    pt1 = request_data["pt1"]
    pt2 = request_data["pt2"]
    coord1_lat = request_data["coord"][0][0]
    coord1_lng = request_data["coord"][0][1]
    coord2_lat = request_data["coord"][1][0]
    coord2_lng = request_data["coord"][1][1]

    cur.execute("INSERT INTO line_segments(pt1, pt2, coord1_lat, coord1_lng, coord2_lat, coord2_lng) VALUES (%s, %s, %s, %s, %s, %s)", (pt1, pt2, coord1_lat, coord1_lng, coord2_lat, coord2_lng))

    mysql.connection.commit()
    cur.close()

    return "Inserted Line Segment with: pt1: " + str(pt1) + " pt2: " + str(pt2) + " coord1_lat: " + str(coord1_lat) + " coord1_lng: " + str(coord1_lng) + " coord2_lat: " + str(coord2_lat) + " coord2_lng: " + str(coord2_lng)

#updates a new line segment
@app.route('/updateLineSegment', methods=['POST'])
def api_update_line_segment():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()

    pt1 = request_data["pt1"]
    pt2 = request_data["pt2"]
    coord1_lat = request_data["coord"][0][0]
    coord1_lng = request_data["coord"][0][1]
    coord2_lat = request_data["coord"][1][0]
    coord2_lng = request_data["coord"][1][1]

    cur.execute("UPDATE line_segments SET coord1_lat = %s, coord1_lng = %s, coord2_lat = %s, coord2_lng = %s WHERE pt1 = %s AND pt2 = %s", (coord1_lat, coord1_lng, coord2_lat, coord2_lng, pt1, pt2))

    mysql.connection.commit()
    cur.close()

    return "Inserted Line Segment with: pt1: " + str(pt1) + " pt2: " + str(pt2) + " coord1_lat: " + str(coord1_lat) + " coord1_lng: " + str(coord1_lng) + " coord2_lat: " + str(coord2_lat) + " coord2_lng: " + str(coord2_lng)

#delete line segment by labels
@app.route('/deleteLineSegment', methods=['POST'])
def api_delete_line_segment():
    request_data = request.get_json();
    print(request_data);

    cur = mysql.connection.cursor()

    pt1 = request_data["pt1"]
    pt2 = request_data["pt2"]

    cur.execute("DELETE FROM line_segments WHERE pt1 = %s && pt2 = %s", (pt1, pt2,))

    mysql.connection.commit()
    cur.close()

    return "Delete line segment with: label: " + str(pt1) + " " + str(pt2)

#uploads image marker image to the assets directory
@app.route('/uploadImage', methods=['POST'])
def api_upload_image():
    print('hello')
    print(request.files)
    
    file = request.files['file']
    # folder = request.files['folder']
    folder = "markers"

    #defautly set it to markers if an invalid string is passed into folder
    # if(folder != "camera" or folder != "markers"):
    #     folder = "markers"

    # blob = request.files['file'].read()    
    # print(blob)
    # img = Image.open(request_data.stream)
    # img.show()
    # img.save("imagefile.jpg")

    filename = secure_filename(file.filename)
    #filename = file.filename
    filepath = app.config['UPLOAD_FOLDER'] + str(folder) + "/" + str(filename)

    #check if file exists if not then upload the image
    my_file = Path(filepath)
    if not my_file.is_file():
        file.save(os.path.join(app.config['UPLOAD_FOLDER'] + "/" + folder, filename))

    return filepath

#uploads camera image to the directories
@app.route('/uploadCameraImage', methods=['POST'])
def api_upload_camera_image():
    request_data = request.get_json();
    print(request_data);
    
    filename = ntpath.basename(request_data["link"]);
    filename_split, file_extension = os.path.splitext(filename)
    filepath = app.config['UPLOAD_FOLDER'] + "camera/" + filename_split + ".jpg"
    urllib.request.urlretrieve(request_data["link"], filepath)
    #file.save(os.path.join(app.config['UPLOAD_FOLDER'] + "/camera", filename))

    return filepath

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