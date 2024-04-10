const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
      if(userswithsamename.length > 0){
        return false;
      } else {
        return true;
      }
    }

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log("you put",username,password);
  if (!username || !password){
    return res.status(404).json({message: "Error logging in"});
  }
  if (authenticatedUser(username,password)){
    let accessToken = jwt.sign({
        data:password
    }, 'access', {expiresIn: 60 * 60});
    req.session.authorization = {
        username: username,
        accessToken: accessToken};
    return res.status(200).send("User successfully logged in "+ req.session.authorization.username);
  } else {
    return res.status(208).json({message:"Invalid Login. Check username and password"})
  }

}
);

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  console.log("your username is ",username, "ibsn",isbn);

  if(!username || !isbn || !review) {
    return res.status(400).json({message:"Missing required parameters"});
  }

  let book = books[isbn];
  if (!book){
    return res.status(400).json({message:"Book ISBN not found"})
  }
  if (book.reviews[username]){
    book.reviews[username] = review;
    return res.status(200).json({message:"Review modified successfully"});
  } else {
    book.reviews[username] = review;
    return res.status(200).json({message:"Review added successfully"})
  } 
});

// delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    const username = req.session.authorization.username;
    
    if (book.reviews[username]){
        delete book.reviews[username];
        res.send("Review deleted successfully");
    } else {
        res.send("Review not found for this user and ISBN");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
