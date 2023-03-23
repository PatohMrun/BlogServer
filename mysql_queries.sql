create database blogs;

 create table articles(
    id INT AUTO_INCREMENT PRIMARY KEY,
    Title varchar(500) not null,
    Content longtext not null,
    BlogType varchar(100) not null,
    Author varchar(50) not null,
    email VARCHAR(255) NOT NULL,
    Date_created varchar(20) NOT NULL
    );
    FOREIGN KEY(email) REFERENCES Admins(email)


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
  description 	TEXT NOT NULL,
  Approval VARCHAR(30) DEFAULT "pending"
);


CREATE TABLE replies (
  RID INT AUTO_INCREMENT PRIMARY KEY,
  CID varchar(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  comment varchar(500) NOT NULL
);
CREATE TABLE messages (
  messageID INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  messages varchar(500) NOT NULL,
  sent_at varchar(20) NOT NULL
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
CREATE TABLE views (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT(5) NOT NULL,
    isViewed varchar(10) NOT NULL
);

-- insert into articles (Title,Content,BlogType,Author,email)
-- values("Testing","orem ipsum dolor sit, amet consectetur adipisicing elit. Saepe odio nam perspiciatis dicta autem sequi nesciunt, veritatis quibusdam vitae sunt doloribus quo vero dolorum impedit reprehenderit enim, officia ut quae? Consectetur nisi commodi perferendis debitis reiciendis, possimus error minus laudantium illo? Neque reiciendis placeat maxime commodi at omnis nihil rerum nisi autem est eaque fugiat ex nam saepe corporis, rem expedita quia sint iure! Provident labore laboriosam, porro quas aperiam quis ipsa eum fugiat impedit? Voluptate commodi odio nisi sed facere corporis repellat delectus consectetur consequatur. Ad est voluptatem laborum, velit nobis, odio id aliquid itaque labore tempora mollitia. Quidem?", "Technologies","Sir Justus", "jgathiru02@gmail.com");

