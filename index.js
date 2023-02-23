const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.SALT; // replacee this with your own secret key
const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.PD,
  database: process.env.DB,
});

db.connect((err, req) => {
  if (err) console.log(err);
  else console.log("Database Connected");
});

// const db = mysql.createConnection(process.env.DATABASE_URL);
// db.connect((err) => {
//   if (err) console.log(err);
//   else console.log("Connected to PlanetScale!");
// });

app.get("/blogs", (err, res) => {
  const data = "select*from articles";
  db.query(data, (err, blogs) => {
    if (err) {
      console.log("no data");
    } else {
      res.send(blogs);
    }
  });
});

app.get("/blogs/:id", (req, res) => {
  const { id } = req.params;
  const data = "select *from articles where id=?";
  db.query(data, id, (err, blogs) => {
    if (err) {
      console.log("no data");
    } else {
      res.send(blogs);
    }
  });
});

app.get("/blogs/types/:BlogType", (req, res) => {
  const { BlogType } = req.params;
  const data = "select *from articles where BlogType=?";
  db.query(data, BlogType, (err, blogs) => {
    if (err) {
      console.log("no that category");
    } else {
      res.send(blogs);
    }
  });
});

app.delete("/blogs/:id", (req, res) => {
  const { id } = req.params;
  const data = "delete from articles where id=?";
  db.query(data, id, (err, blogs) => {
    if (err) {
      console.log("Not Deleted");
    } else {
      res.send(blogs);
    }
  });
});

app.post("/blogs", (req, res) => {
  const Title = req.body.Title;
  const Author = req.body.Author;
  const Content = req.body.content;
  const BlogType = req.body.BlogType;

  const InsertBlogs =
    "insert into articles(Title,Author,Content,BlogType ) values(?,?,?,?)";
  db.query(InsertBlogs, [Title, Author, Content, BlogType], (err, result) => {
    if (err) res.send(err.message);
    else res.send(result);
  });
});
app.post("/signUps", async (req, res) => {
  const { name, email, password } = req.body;

  // const hashedPassword = await bcrypt.hash(password, 10);

  const checkEmail = "SELECT * FROM Admins WHERE email = ?";
  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  //checks whether the email is used or signed in as Admin
  db.query(checkEmail, [email], (error, result) => {
    if (result.length > 0) {
      console.log("this email already in use" + result); //email already exists
      return res.status(500).json({ error: "That email is already in use" });
    } else {
      db.query(query, [name, email, password], (error, result) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ error: "Error inserting data into the database" });
        }
        console.log(password);
        console.log("Data inserted successfully");
        return res.status(200).json({ message: "Sign up successful" });
      });
    }
  });
});

app.post("/signUpAdmins", async (req, res) => {
  const { name, email, password, phone_number, description } = req.body;
  // const hashedPassword = await bcrypt.hash(password, 10);
  const checkEmail = "SELECT * FROM users WHERE email = ?";
  const query =
    "INSERT INTO Admins (name, email, password, phone_number, description) VALUES (?, ?, ?, ?, ?)";
  db.query(checkEmail, [email], (error, result) => {
    if (result.length > 0) {
      console.log("this email already in use in" + result); //email already exists
      //email already exists
      return res.status(500).json({ error: "That email is already in use" });
    } else {
      db.query(
        query,
        [name, email, password, phone_number, description],
        (error, result) => {
          if (error) {
            return res
              .status(500)
              .json({ error: "Error inserting data into the database" });
          }
          console.log(result);
          console.log("User sign up successfully");
          return res.status(200).json({ message: "Sign up successful" });
        }
      );
    }
  });
});

app.post("/comments", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const content = req.body.comments;
  const post_id = req.body.id;
  const parent_comment_id = req.body.parent_comment_id || null;

  const insertComment =
    "INSERT INTO comments (post_id, name, email, parent_comment_id, content, timestamp) VALUES (?, ?, ?, ?,?, NOW())";

  db.query(
    insertComment,
    [post_id, name, email, parent_comment_id, content],
    (error, result) => {
      if (error) {
        console.log("Error inserting comment into database:", error);
        return res
          .status(500)
          .json({ error: "Error inserting comment into the database" });
      }

      console.log("Comment inserted into database:", result.insertId);
      return res.status(200).json({ message: "Comment added successfully" });
    }
  );
});
app.post("/like", (req, res) => {
  const isLiked = req.body.isLiked;
  const post_id = req.body.post_id;
  console.log(isLiked);
  // Check if a row with the post_id already exists
  const selectQuery = "SELECT * FROM likes WHERE post_id = ?";
  db.query(selectQuery, [post_id], (err, rows) => {
    if (err) {
      console.log("Error selecting from likes table:", err);
      return res
        .status(500)
        .json({ error: "Error selecting from likes table" });
    }

    // If a row with the post_id exists, update the isLiked column
    if (rows.length > 0) {
      const updateQuery =
        "UPDATE likes SET isLiked = isLiked +  ? WHERE post_id = ?";
      db.query(updateQuery, [isLiked, post_id], (err, resp) => {
        if (err) {
          console.log("Error updating likes in database:", err);
          return res
            .status(500)
            .json({ error: "Error updating likes in the database" });
        }
        console.log("Likes updated in database:");
        return res.status(200).json({ message: "Likes updated successfully" });
      });

      // If no row with the post_id exists, insert a new row with the post_id and isLiked values
    } else {
      const insertQuery = "INSERT INTO likes (post_id, isLiked) VALUES (?, ?)";
      db.query(insertQuery, [post_id, isLiked], (err, resp) => {
        if (err) {
          console.log("Error inserting likes into database:", err);
          return res
            .status(500)
            .json({ error: "Error inserting likes into the database" });
        }
        console.log("Likes inserted into database:");
        return res.status(200).json({ message: "Likes added successfully" });
      });
    }
  });
});

app.get("/getlikes/:id", (req, res) => {
  const { id } = req.params;
  const likesQuery = "SELECT * FROM likes WHERE post_id = ?";
  db.query(likesQuery, [id], (err, likes) => {
    if (err) {
      console.log("Error retrieving likes from database:", err);
      return res
        .status(500)
        .json({ error: "Error retrieving likes from the database" });
    }
    console.log("Likes retrieved from database:" + likes);
    res.send(likes);
    // return res.status(200).json({ likes });
  });
});
app.get("/getComments", (err, res) => {
  const comments = "select*from comments";
  db.query(comments, (err, comments) => {
    if (err) {
      console.log("This is the error: " + err);
    } else {
      res.send(comments);
    }
  });
});
app.get("/getComments/:id", (err, res) => {
  const comments = "select*from comments";
  db.query(comments, (err, comments) => {
    if (err) {
      console.log("This is the error: " + err);
    } else {
      res.send(comments);
    }
  });
});
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide both email and password",
    });
  }
  const usersQuery = "SELECT * FROM users WHERE email = ?";
  const adminsQuery = "SELECT * FROM Admins WHERE email = ?";

  db.query(usersQuery, [email], (error, results) => {
    if (error) console.log(error);

    if (!results || !results.length) {
      db.query(adminsQuery, [email], (error, results) => {
        if (error) console.log(error);

        if (!results || !results.length) {
          console.log("Admin not found");
          return res.status(400).json({
            message: "Name not found",
          });
        }

        const admin = results[0];
        bcrypt.compare(
          password.toString(),
          admin.password.toString(),
          (err, isMatch) => {
            if (err) {
              console.log("Error while comparing passwords: ", err);
              return res.status(400).json({
                message: "An error occurred while comparing passwords",
              });
            }
            if (!isMatch) {
              console.log("Password incorrect");
              return res.status(400).json({
                message: "Password incorrect",
              });
            }

            // sign a JWT token for the authenticated user
            const token = jwt.sign(
              { role: "admin", name: results[0].name },
              secretKey,
              {
                expiresIn: "1h",
              }
            );
            return res.status(200).json({
              message: "as Admin",
              token,
            });
          }
        );
      });
      return;
    }

    const user = results[0];
    bcrypt.compare(
      password.toString(),
      user.password.toString(),
      (err, isMatch) => {
        if (err) {
          console.log("Error while comparing passwords: ", err);
          return res.status(400).json({
            message: "An error occurred while comparing passwords",
          });
        }
        if (!isMatch) {
          console.log("Password incorrect");
          return res.status(400).json({
            message: "Password incorrect",
          });
        }
        // sign a JWT token for the authenticated user
        const token = jwt.sign(
          { role: "user", name: results[0].name },
          secretKey,
          {
            expiresIn: "1h",
          }
        );
        return res.status(200).json({
          message: "as user",
          token,
        });
      }
    );
  });
});

app.listen(8000, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Listening on port 8000");
  }
});
