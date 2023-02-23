create database blogs;

 create table articles(
    id INT AUTO_INCREMENT PRIMARY KEY,
    Title varchar(500) not null,
    Content longtext not null,
    BlogType varchar(100) not null,
    Author varchar(50) not null
    );


CREATE TABLE users (
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL PRIMARY KEY,
  password VARBINARY(60) NOT NULL
);

CREATE TABLE Admins (
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL PRIMARY KEY,
  password VARBINARY(60) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  description 	VARCHAR(255) NOT NULL
);

CREATE TABLE comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  id varchar(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  parent_comment_id INT DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  comment varchar(500) NOT NULL
);

CREATE TABLE replies (
  RID INT AUTO_INCREMENT PRIMARY KEY,
  CID varchar(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  comment varchar(500) NOT NULL
);

CREATE TABLE comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    parent_comment_id INT DEFAULT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME NOT NULL
);
CREATE TABLE likes (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT(5) NOT NULL,
    isLiked varchar(4) NOT NULL
);

