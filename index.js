const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")
const saltRounds = 10;
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Pusher = require("pusher");

const secretKey = process.env.SALT; // replacee this with your own secret key
const app = express();
const corsOptions = {
  origin: 'https://innovate-zone.vercel.app/',
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

const pusher = new Pusher({
  appId: "1563717",
  key: "7f4d57257fa18a056578",
  secret: "6dab83dde2eb4b61e2bd",
  cluster: "ap2",
  useTLS: true
});

//restricting so that the server can only communucate with the front end only
// app.use((req, res, next) => {
//   const apiKey = req.query.api_key;
//   if (!apiKey || apiKey !== 'UD9VZKyRU5eIZzPq') {
//     res.status(401).send('Unauthorized Access');
//   } else {
//     next();
//   }
// });


// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: process.env.PD,
//   database: process.env.DB,
// });

// db.connect((err, req) => {
//   if (err) console.log(err);
//   else console.log("Database Connected");
// });

const db = mysql.createConnection('mysql://ruhevgyur9isopdwey7h:pscale_pw_KRUtxiXzmIZuHN75FIeGf4dHSeIJ8ZWsm1tVdAHNNl5@us-east.connect.psdb.cloud/blog_db?ssl={"rejectUnauthorized":true}');
db.connect((err) => {
    if (err) console.log(err);
    else console.log("Connected to PlanetScale!");
  });
  
  // db.query("SELECT * FROM comments", (err, results) => {
  //   if (err) throw err;
  //   pusher.trigger("innovate-Zone", "inserted", results);
  // });


//selecting secured Routes
app.get('/blogs', (req, res) => {
  const apiKey = req.query.api_key;
  if (!apiKey || apiKey !== 'UD9VZKyRU5eIZzPq') {
    res.status(401).send('Unauthorized');
  } else {
    const data = "select*from articles";
    db.query(data, (err, blogs) => {
      if (err) {
        console.log("no data");
      } else {
        res.send(blogs);
      }
    });
  }
});

app.get("/",(req,res)=>{
  res.send('Never go to bed mad. Stay up and fight😂')
})

//sending mails using node mailer

// app.post("/mails",(req,res)=>{
//     const Name = req.body.name;
//     const Email = req.body.email;
//     const Message = req.body.message;
//     console.log(Name, Email, Message);
//     // do something with the data, e.g. send to email
    // let transporter = nodemailer.createTransport({
    //     service: "gmail",
    //     auth: {
    //       user: process.env.EMAIL,
    //       pass: process.env.PASS,
    //     },
    // });
    // try {
    //     // Send the email using nodemailer
    //     const emailRes = transporter.sendMail({
    //       from: { name: Name , address: Email },
    //       to: process.env.EMAIL,
    //       replyTo: Email,
    //       subject: "Message From Your website",
    //       html: `
    //       <p>${Message}</p>
    //       <h4>Message From: ${Name}</h4>
    //     `,
    //     });
    //     console.log("message sent");
    //     res.send('Received the message and sent email!');
    // } catch (error) {
    //     console.log(error);
    //     res.status(500).send('Failed to send email');
    // }
// })







app.get("/blogs/:id", (req, res) => {
  const apiKey = req.query.api_key;
  if (!apiKey || apiKey !== 'UD9VZKyRU5eIZzPq') {
    res.status(401).send('Unauthorized');
    return
  }
  const { id } = req.params;
  const data = "select * from articles where id=?";
  db.query(data, id, (err, blogs) => {
    if (err) {
      console.log("no data");
    } else {
      res.send(blogs);

      // Check if a row with the post_id already exists
      const selectQuery = "SELECT * FROM views WHERE post_id = ?";
      db.query(selectQuery, [id], (err, rows) => {
        if (err) {
          console.log("Error selecting from views table:", err);
        } else {
          // If a row with the post_id exists, update the isLiked column
          if (rows.length > 0) {
            const updateQuery =
              "UPDATE views SET isViewed = isViewed +  ? WHERE post_id = ?";
            db.query(updateQuery, [1, id], (err, resp) => {
              if (err) {
                console.log("Error updating views in database:", err);
              } else {
                console.log("views updated in database:");
              }
            });

            // If no row with the post_id exists, insert a new row with the post_id and isViewed values
          } else {
            const insertQuery =
              "INSERT INTO views (post_id, isViewed) VALUES (?, ?)";
            db.query(insertQuery, [id, 1], (err, resp) => {
              if (err) {
                console.log("Error inserting views into database:", err);
              } else {
                console.log("views inserted into database:");
              }
            });
          }
        }
      });
    }
  });
});



app.get("/getViews", (req, res) => {
  // const { id } = req.params;
  const ViewsQuery = "SELECT * FROM views";
  db.query(ViewsQuery, (err, views) => {
    if (err) {
      console.log("Error retrieving views from database:", err);
      return res
        .status(500)
        .json({ error: "Error retrieving likes from the database" });
    }
    res.send(views);
  });
});
// app.get("/getViews/:id", (req, res) => {
//   const { id } = req.params;
//   const ViewsQuery = "SELECT * FROM views WHERE post_id = ?";
//   db.query(ViewsQuery, [id], (err, views) => {
//     if (err) {
//       console.log("Error retrieving views from database:", err);
//       return res
//         .status(500)
//         .json({ error: "Error retrieving likes from the database" });
//     }
//     res.send(views);
//     return res.status(200).json({ likes });
//   });
// });



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
  const email = req.body.email;

  const InsertBlogs =
    "insert into articles(Title,Author,Content,BlogType,email,Date_created ) values(?,?,?,?,?,NOW())";
  db.query(
    InsertBlogs,
    [Title, Author, Content, BlogType, email],
    (err, result) => {
      if (err) res.send(err.message);
      else res.send(result);
    }
  );
});
//Update a blog
app.post("/blogUpdate", (req, res) => {
  const Title = req.body.Title;
  const Author = req.body.Author;
  const Content = req.body.content;
  const BlogType = req.body.BlogType;
  const email = req.body.email;
  const id = req.body.id;

  const updateBlog =
    "UPDATE articles SET Title = ?, Author = ?, Content = ?, BlogType = ?, email = ?, Date_created = NOW() WHERE id = ?";
  db.query(
    updateBlog,
    [Title, Author, Content, BlogType, email, id],
    (err, result) => {
      if (err) res.send(err.message);
      else res.send(result);
    }
  );
});


// //inserting message in the database
app.post("/mails", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const messages = req.body.message;

  const InsertMessages =
    "insert into messages(name,email,messages, sent_at) values(?,?,?,NOW())";
  db.query(InsertMessages, [name, email, messages], (err, result) => {
    if (err) res.send(err.message);
    else res.send(result);
    console.log(result);
  });
});


app.get("/sms", (err, res) => {
  const data = "select*from messages";
  db.query(data, (err, mes) => {
    if (err) {
      console.log("no data");
    } else {
      res.send(mes);
    }
  });
});

app.get("/GuestBloggers",(req, res)=>{
  const apiKey = req.query.api_key;
    if (!apiKey || apiKey !== 'UD9VZKyRU5eIZzPq') {
      res.status(401).send('Unauthorized Access');
      return
    }
  const NoOfAdmins= 'SELECT * from Admins where Approval="Approved"';
  // const NoOfAdmins= 'SELECT count(*) as Bloggers from Admins where Approval="Approved"';
  db.query(NoOfAdmins,(err,admins)=>{
    if (err) {
      console.log(err);
    }
    else res.send(admins);
  })
  })

  app.post("/removeAdmin",(req,res)=>{
    const email=req.body.email
    console.log("the email is "+email);
    const remove="Delete from Admins where email = ?";
    db.query(remove,[email],(err, result)=>{
      if (err){
        console.log(err);
      }
      else{
        console.log(email + ' removed successfully');
        res.send(email + ' removed successfully')
      }
    })
  })

  //Selecting the pending Approval
app.get("/Approval",(err, res)=>{
  const Approvals= 'SELECT *from Admins where Approval="pending"';
  db.query(Approvals,(err,admins)=>{
    if (err) {
      console.log(err);
    }
    else res.send(admins);
  })
  })

  //Selecting the pending Approval
  app.post("/Approved", async(req, res) => {
    const { email } = req.body; // get the email from the request body
    const Approvals = "UPDATE Admins SET Approval = 'Approved' WHERE email = ?";
    db.query(Approvals, [email], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating Approval status");
      } else {
        console.log(`Updated Approval stat  us for ${email}`);
        res.send("Approval status updated successfully");
      }
    });
  });
  //Rejecting the approval request
  app.post("/rejected", async(req, res) => {
    const { email } = req.body; // get the email from the request body
    console.log("The email is  "+email);
    const Approvals = "UPDATE Admins SET Approval = 'rejected' WHERE email = ?";
    db.query(Approvals, [email], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating Approval status");
      } else {
        console.log(`Updated Approval stat  us for ${email}`);
        res.send("Approval status updated successfully");
      }
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
            console.log(error);
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
    // console.log("Likes retrieved from database:" + likes);
    res.send(likes);
    // return res.status(200).json({ likes });
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
      // pusher.trigger("innovate-Zone", "new-comment", { id: result.insertId, content, post_id: req.params.id });
      console.log("Comment inserted into database:", result.insertId);
      return res.status(200).json({ message: "Comment added successfully" });
    }
  );
});

// app.get("/getComments", (err, res) => {
//   const comments = "select*from comments";
//   db.query(comments, (err, comments) => {
//     if (err) {
//       console.log("This is the error: " + err);
//     } else {
//       res.send(comments);
//     }
//   });
// });
// Define the route for getting comments
app.get('/getComments/:id', (req, res) => {
  const commentsQuery = "SELECT * FROM comments";
  
  // Execute the SQL query to get all comments from the database
  db.query(commentsQuery, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving comments from database');
    } else {
      // Send the comments back as the HTTP response
      res.send(results);
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
              { role: "admin", name: results[0].name, email: results[0].email},
              secretKey,
              {
                expiresIn: "1h",
              }
            );
            return res.status(200).json({
              message: "as Admin",
              token,
              Approval:results[0].Approval,
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
          { role: "user", name: results[0].name, email: results[0].email },
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
