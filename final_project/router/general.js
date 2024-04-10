const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) { 
      users.push({"username":username,"password":password});
      console.log(users);
      return res.status(200).json({message: "User registred successfully"});
    } else {
      return res.status(404).json({message: "User already exists"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});

});

// Get the book list available in the shop (with promises)
public_users.get('/', function (req, res) {
    let myPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(books);
      }, 500); 
    })
    myPromise.then((books) => {
      res.send(JSON.stringify(books, null, 4));
    })
  });
  

// Get book details based on ISBN (with promise)
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  let myPromise = new Promise((resolve,reject) => {
    setTimeout(() => {
        resolve(books[isbn])
    },500)
  });
  myPromise.then((book) => {
    res.send(book)
  })
 });
  
// Get book details based on author with Promise
public_users.get('/author/:author', function (req, res) {
    let author = req.params.author;
    let filteredBooks = [];
  
    let filterPromise = new Promise((resolve, reject) => {
      for (isbn in books) {
        let book = books[isbn];
        if (book.author == author) {
          filteredBooks.push(book);
        }
      }
      resolve(filteredBooks);
    });
  
    filterPromise.then((filteredBooks) => {
      if (filteredBooks.length > 0) {
        res.send(filteredBooks);
      } else {
        res.send("The author was not found in the database");
      }
    });
  });
  

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let title = req.params.title;
    let filterPromise = new Promise((resolve, reject) => {
        let filteredBooks = [];
        for (isbn in books) {
          let book = books[isbn];
          if (book.title == title) {
            filteredBooks.push(book);
          }
        }
        resolve(filteredBooks);
      });
    
      filterPromise.then((filteredBooks) => {
        if (filteredBooks.length > 0) {
          res.send(filteredBooks[0]);
        } else {
          res.send("The book title was not found in the database");
        }
      })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  let reviews = books[isbn].reviews;
  res.send(reviews);
});

module.exports.general = public_users;
