create database IF NOT EXISTS school_map;
use school_map;

CREATE TABLE IF NOT EXISTS map_settings(
    id int NOT NULL AUTO_INCREMENT,
    map_image varchar(255) NOT NULL,
    map_height float NOT NULL,
    map_width float NOT NULL,
    PRIMARY KEY (id)
) ENGINE=INNODB;

INSERT INTO map_settings(map_image, map_height, map_width) VALUES ("./doushishaRyokanBldg.jpg", 700, 1200);

CREATE TABLE IF NOT EXISTS markers (
    label int NOT NULL,
    lat float NOT NULL,
    lng float NOT NULL,
    picture varchar(255), 
    PRIMARY KEY (label)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS image_markers(
    image_markers_id int NOT NULL AUTO_INCREMENT, 
    marker_label int NULL,
    label int NOT NULL,
    lat float NOT NULL,
    lng float NOT NULL,
    picture varchar(255),
    PRIMARY KEY ( image_markers_id ),
    FOREIGN KEY ( marker_label ) REFERENCES markers( label )  
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS line_segments (
    line_segment_id int NOT NULL AUTO_INCREMENT,
    pt1 int NOT NULL,
    pt2 int NOT NULL,
    coord1_lat float NOT NULL,
    coord1_lng float NOT NULL,
    coord2_lat float NOT NULL,
    coord2_lng float NOT NULL, 
    PRIMARY KEY (line_segment_id),
    FOREIGN KEY ( pt1 ) REFERENCES markers( label ),  
    FOREIGN KEY ( pt2 ) REFERENCES markers( label )
) ENGINE=INNODB;