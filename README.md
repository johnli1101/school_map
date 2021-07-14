# School Map

## Set Up
* Git clone to local directory via: **"git clone https://github.com/johnli1101/school_map.git"**
* **“cd”** into the front_end directory and run the command **“npm install”** to retrieve all the dependencies
* Make sure to install mysql if it isn't already installed. And create database **“school_map”**
  * **IMPORTANT**: make sure that when you set up mysql that it does not have a password for the root user
* After mysql is set **“cd”** into the **“back_end”** directory and run the command **“mysql -uroot < initialize_tables.sql”** this should input all the tables 
* In the “back_end” directory run the command **“python3 camera_backend.py”** to start the backend server
* Go back to the front_end directory and run the command **“npm run electron:serve”** which should start up the electron application
* Turn on the THETA camera and connect your computer to the THETA camera wifi
* Now you should be able to access the camera API when clicking the camera icon after creating a marker. And also the icons should appear now
