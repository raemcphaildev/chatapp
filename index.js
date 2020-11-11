var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser');

io = require('express')();
io.use(cookieParser());
app.use(cookieParser());

app.get('/', (req, res) => {
  console.log("Cookies: ", req.cookies)
  res.cookie ("user", "bob", { maxAge: 60 * 60 * 1000});
  res.cookie ("colour", "red", { maxAge: 60 * 60 * 1000});
  res.cookie ("user", "jerry", { maxAge: 60 * 60 * 1000});
  res.sendFile(__dirname + '/index.html');
});

// //JSON object to be added to cookie 
// let users = { 
//   name : "Ritik", 
//   Age : "18"
// } 
    
//   //Route for adding cookie 
// app.get('/setuser', (req, res)=>{ 
//   res.cookie("userData", users); 
//   res.send('user data added to cookie'); 
// }); 

// //Iterate users data from cookie 
// app.get('/getuser', (req, res)=>{ 
//   //shows all the cookies 
//   res.send(req.cookies); 
// });

io.on('connection', (socket) => {
  
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        socket.broadcast.emit('chat message', msg);
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.static(path.join(__dirname, "static")));
