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
// const Pusher = require("pusher");

const secretKey = process.env.SALT; // replacee this with your own secret key
const app = express();

app.use(cors());
app.use(bodyParser.json());

// const pusher = new Pusher({
//   appId: "1563717",
//   key: "7f4d57257fa18a056578",
//   secret: "6dab83dde2eb4b61e2bd",
//   cluster: "ap2",
//   useTLS: true
// });

const { Pool } = require("pg");

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


// const db = mysql.createConnection('mysql://ruhevgyur9isopdwey7h:pscale_pw_KRUtxiXzmIZuHN75FIeGf4dHSeIJ8ZWsm1tVdAHNNl5@us-east.connect.psdb.cloud/blog_db?ssl={"rejectUnauthorized":true}');
// db.connect((err) => {
//     if (err) console.log(err);
//     else console.log("Connected to PlanetScale!");
//   });
  
  const pool = new Pool({
    connectionString: "postgresql://jgathiru02:7yQJ1YchmTrF@ep-blue-bonus-279933.us-east-1.aws.neon.tech/blog_db?sslmode=require",
    // connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // This is required if you're connecting to a remote database with self-signed SSL certificate
      sslmode: 'require'
    } 
  });  
  
  (async () => {
    try {
      const client = await pool.connect();
      const result = await client.query("SELECT current_user");
      const username = result.rows[0].current_user;
      console.log("Database connected. Current username:", username);
      client.release();
    } catch (error) {
      console.error("Error connecting to database:", error);
    }
  })();
  

  
  //pool.query("SELECT * FROM comments", (err, results) => {
  //   if (err) throw err;
  //   pusher.trigger("innovate-Zone", "inserted", results);
  // });


//selecting secured Routes
app.get('/blogs', (req, res) => {
  // console.log("called, its time to server");
  const apiKey = req.query.api_key;
  if (!apiKey || apiKey !== 'UD9VZKyRU5eIZzPq') {
    res.status(401).send('Unauthorized');
  } else {
    const data = "select*from articles";
   pool.query(data, (err, data) => {
      if (err) {
        console.log("no data");
      } 
      res.status(200).send(data?.rows);
    });
  }
});

app.get("/",(req,res)=>{
  res.status(200).send('Never go to bed mad. Stay up and fight😂')
})



app.get("/blogs/:id", (req, res) => {
  const apiKey = req.query.api_key;
  if (!apiKey || apiKey !== 'UD9VZKyRU5eIZzPq') {
    res.status(401).send('Unauthorized');
    return
  }
  const { id } = req.params;
  const data = "select * from articles where id= $1";
  console.log(id);
 pool.query(data, [id], (err, blogs) => {
    if (err) {
      // console.log("an errtrrr occured");
    } else {

      res.status(200).send(blogs.rows);

      // Check if a row with the post_id already exists
      const selectQuery = "SELECT * FROM views WHERE post_id = $1";
     pool.query(selectQuery, [id], (err, rows) => {
        if (err) {
          console.log("Error selecting from views table:", err);
        } else {
          // If a row with the post_id exists, update the isLiked column
          if (rows.length > 0) {
            const updateQuery =
              "UPDATE views SET isViewed = isViewed +  $1 WHERE post_id = $2";
           pool.query(updateQuery, [1, id], (err, resp) => {
              if (err) {
                console.log("Error updating views in database:", err);
              } else {
                console.log("views updated in database:");
              }
            });

            // If no row with the post_id exists, insert a new row with the post_id and isViewed values
          } else {
            const insertQuery =
              "INSERT INTO views (post_id, isViewed) VALUES ($1, $2)";
           pool.query(insertQuery, [id, 1], (err, resp) => {
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
 pool.query(ViewsQuery, (err, views) => {
    if (err) {
      console.log("Error retrieving views from database:", err);
      return res
        .status(500)
        .json({ error: "Error retrieving likes from the database" });
    }
    res.status(200).send(views.rows);
  });
});
// app.get("/getViews/:id", (req, res) => {
//   const { id } = req.params;
//   const ViewsQuery = "SELECT * FROM views WHERE post_id = ?";
//  pool.query(ViewsQuery, [id], (err, views) => {
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
  const data = "select *from articles where BlogType=$1";
 pool.query(data, BlogType, (err, blogs) => {
    if (err) {
      console.log("no that category");
    } else {
      res.status(200).send(blogs.rows);
    }
  });
});

app.delete("/blogs/:id", (req, res) => {
  const { id } = req.params;
  const data = "delete from articles where id=$1";
 pool.query(data, [id], (err, blogs) => {
    if (err) {
      console.log("Not Deleted", err);
      //return status
      res.status(500).send("Not Deleted");
    } else {
      res.status(200).send(blogs.rows);
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
    "insert into articles(Title,Author,Content,BlogType,email,Date_created ) values($1, $2, $3, $4, $5,NOW())";
 pool.query(
    InsertBlogs,
    [Title, Author, Content, BlogType, email],
    (err, result) => {
      if (err){
        console.log("an error occured while inserting the blog", err.message);
        res.status(500).send(err.message);
      }
      else{
        console.log("added successfuly");
        res.status(200).send(result?.rows);
      }
     
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
    "UPDATE articles SET Title = $1, Author = $2, Content = $3, BlogType = $4, email = $5, Date_created = NOW() WHERE id = $6";
 pool.query(
    updateBlog,
    [Title, Author, Content, BlogType, email, id],
    (err, result) => {
      if (err){
        console.log("error occured updating the blog", err);
        res.status(500)
      }
      else {
        console.log("updated successfully");
        res.status(200).send(result.rows);
      }
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
 pool.query(InsertMessages, [name, email, messages], (err, result) => {
    if (err) res.status(500).send(err.message);
    else  res.status(200).send(result.rows);
    // console.log(result.rows);
  });
});


app.get("/sms", (err, res) => {
  const data = "select*from messages";
 pool.query(data, (err, mes) => {
    if (err) {
      console.log("no data");
    } else {
      res.status(200).send(mes.rows);
    }
  });
});

app.get("/GuestBloggers",(req, res)=>{
  const apiKey = req.query.api_key;
    if (!apiKey || apiKey !== 'UD9VZKyRU5eIZzPq') {
      res.status(401).send('Unauthorized Access');
      return
    }
  const NoOfAdmins= `select * from Admins where Approval='Approved'`;
  // const NoOfAdmins= 'SELECT count(*) as Bloggers from Admins where Approval="Approved"';
 pool.query(NoOfAdmins,(err,admins)=>{
    if (err) {
      console.log(err);
    }
    else res.status(200).send(admins?.rows);
  })
  })

  app.post("/removeAdmin",(req,res)=>{
    const email=req.body.email
    console.log("the email is "+email);
    const remove="Delete from Admins where email = ?";
   pool.query(remove,[email],(err, result)=>{
      if (err){
        console.log(err);
      }
      else{
        console.log(email + ' removed successfully');
        res.status(200).send(email + ' removed successfully')
      }
    })
  })


  //Selecting the pending Approval
app.get("/Approval",(err, res)=>{
  const Approvals= `SELECT *from Admins where approval='pending'`;
 pool.query(Approvals,(err,admins)=>{
    if (err) {
      console.log(err);
    }
      return res.json(admins.rows);
  })
  })



  //Selecting the pending Approval
  app.post("/Approved", async(req, res) => {
    const { email } = req.body; // get the email from the request body
    const Approvals = "UPDATE Admins SET Approval = 'Approved' WHERE email = $1";
   pool.query(Approvals, [email], (err, result) => {
      if (err) {
        // console.log(err);
        res.status(500).send("Error updating Approval status");
      } else {
        console.log(`Updated Approval stat  us for ${email}`);
        res.status(500).send("Approval status updated successfully");
      }
    });
  });
  //Rejecting the approval request
  app.post("/rejected", async(req, res) => {
    const { email } = req.body; // get the email from the request body
    const Approvals = "UPDATE Admins SET Approval = 'rejected' WHERE email = $1";
   pool.query(Approvals, [email], (err, result) => {
      if (err) {
        // console.log(err);
        res.status(500).send("Error updating Approval status");
      } else {
        console.log(`Updated Approval stat  us for ${email}`);
        res.status(200).send("Approval status updated successfully");
      }
    });
  });


  
app.post("/signUps", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const checkEmail = "SELECT * FROM Admins WHERE email = $1";
  const query = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)";
  //checks whether the email is used or signed in as Admin
 pool.query(checkEmail, [email], (error, result) => {
    if (result.length > 0) {
      console.log("this email already in use" + result); //email already exists
      return res.status(500).json({ error: "That email is already in use" });
    } else {
     pool.query(query, [name, email, hashedPassword], (error, result) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ error: "Error inserting data into the database" });
        }
        // console.log(password);
        console.log("Data inserted successfully");
        return res.status(200).json({ message: "Sign up successful" });
      });
    }
  });
});
  

  
app.post("/signUpAdmins", async (req, res) => {
  // console.log("haya baas");
  const { name, email, password, phone_number, description } = req.body;
  // console.log(password);
  const hashedPassword = await bcrypt.hash(password, 10);
   const checkEmail = "SELECT * FROM users WHERE email = $1";
  const query =
    "INSERT INTO Admins (name, email, password, phone_number, description) VALUES ($1, $2, $3, $4, $5) RETURNING *";
 pool.query(checkEmail, [email], (error, result) => {
    if (result.rows.length > 0) {
      console.log("this email already in use in", result.rows); //email already exists
      //email already exists
      return res.status(500).json({ error: "That email is already in use" });
    } else {
     pool.query(
        query,
        [name, email, hashedPassword, phone_number, description],
        (error, result) => {
          if (error) {
            // console.log(error);
            return res
              .status(500)
              .json({ error: "Error inserting data into the database" });
          }
          // console.log(result);
          const data=result.rows[0]
          console.log("User sign up successfully", data);
          return res.status(200).json({ data });
        }
      );
    }
  });
});




app.post("/like", (req, res) => {
  const isLiked = req.body.isLiked;
  const post_id = req.body.post_id;
  // console.log(isLiked);
  // Check if a row with the post_id already exists
  const selectQuery = "SELECT * FROM likes WHERE post_id = $1";
 pool.query(selectQuery, [post_id], (err, rows) => {
    if (err) {
      console.log("Error selecting from likes table:", err);
      return res
        .status(500)
        .json({ error: "Error selecting from likes table" });
    }
 
    // If a row with the post_id exists, update the isLiked column
    if (rows.length > 0) {
      const updateQuery =
        "UPDATE likes SET isLiked = isLiked +  $1 WHERE post_id = $2";
     pool.query(updateQuery, [isLiked, post_id], (err, resp) => {
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
      const insertQuery = "INSERT INTO likes (post_id, isLiked) VALUES ($1, $2)";
     pool.query(insertQuery, [post_id, isLiked], (err, resp) => {
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
  const likesQuery = "SELECT * FROM likes WHERE post_id = $1";
 pool.query(likesQuery, [id], (err, likes) => {
    if (err) {
      console.log("Error retrieving likes from database:", err);
      return res
        .status(500)
        .json({ error: "Error retrieving likes from the database" });
    }
    // console.log("Likes retrieved from database:" + likes);
    res.status(200).send(likes.rows);
    // return res.status(200).json({ likes });
  }); 
});

 
app.post("/comments", (req, res) => {
  const post_id = req.body.id;
  const name = req.body.name;
  const email = req.body.email;
  const parent_comment_id = req.body.parent_comment_id || null;
  const content = req.body.comments;

  const insertComment =
    "INSERT INTO comments (post_id, name, email, parent_comment_id, content, timestamp) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *";

 pool.query(
    insertComment,
    [post_id, name, email, parent_comment_id, content],
    (error, result) => {
      if (error) {
        // console.log("Error inserting comment into database:", error);
        return res
          .status(500)
          .json({ error: "Error inserting comment into the database" });
      }
      
    //   // Fetch the inserted row from the database
    //   const commentId = result.rows.insertId;
    
    //   const selectComment = "SELECT * FROM comments WHERE comment_id = $1";
      
    //  pool.query(selectComment, [commentId], (selectError, selectResult) => {
    //     if (selectError) {
    //       console.log("Error retrieving inserted comment from the database:", selectError);
    //       return res
    //         .status(500)
    //         .json({ error: "Error retrieving inserted comment from the database" });
    //     }
        
    //     const addedComment = selectResult.rows;
    //     console.log("Comment inserted into database:", addedComment);
    //     return res.status(200).json({ addedComment });
    //   });

    const addedComment = result.rows[0];
    // console.log("Comment inserted into database:", addedComment);
    return res.status(200).json({ addedComment });
    }
  );
});



// Define the route for getting comments
app.get('/getComments/:id', (req, res) => {
  const commentsQuery = "SELECT * FROM comments";
  
  // Execute the SQL query to get all comments from the database
 pool.query(commentsQuery, (err, results) => {
    if (err) {
      // console.log(err);
      res.status(500).send('Error retrieving comments from database');
    } else {
      // Send the comments back as the HTTP response
      res.status(200).send(results.rows);
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
  const usersQuery = "SELECT * FROM users WHERE email = $1";
  const adminsQuery = "SELECT * FROM Admins WHERE email = $1";
 pool.query(usersQuery, [email], (error, results) => {
    if (error) console.log(error);

    if (!results.rows || !results.rows.length) {
     pool.query(adminsQuery, [email], (error, results) => {
        if (error) console.log(error);

        if (!results.rows || !results.rows.length) {
          // console.log("Admin not found");
          return res.status(400).json({
            message: "Name not found",
          });
        }
        // console.log(results.rows);

        const admin = results.rows[0];
        bcrypt.compare(
          password.toString(),
          admin.password.toString(),
          (err, isMatch) => {
            if (err) {
              // console.log("Error while comparing passwords: ", err);
              return res.status(400).json({
                message: "An error occurred while comparing passwords",
              });
            }
            if (!isMatch) {
              // console.log("Password incorrect");
              return res.status(400).json({
                message: "Password incorrect",
              });
            }

            // sign a JWT token for the authenticated user
            const token = jwt.sign(
              { role: "admin", name: results.rows[0].name, email: results.rows[0].email},
              secretKey,
              {
                expiresIn: "1h",
              }
            ); 
            return res.status(200).json({
              message: "as Admin",
              token,
              Approval:results.rows[0].approval,
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
          // console.log("Error while comparing passwords: ", err);
          return res.status(400).json({
            message: "An error occurred while comparing passwords",
          });
        }
        if (!isMatch) {
          // console.log("Password incorrect");
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
