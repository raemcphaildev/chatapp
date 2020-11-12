var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser');
var cookie = require("cookies");

app.use(cookieParser());

var nextUser = 1;

var userNames = {};
var colors = {};


function checkUserName(name) {
  used = false
  for(key in userNames){
    if(userNames[key] === name) {
      used = true;
    }
  }
  return used;
}
function assignUserName(name, num) {
  used = checkUserName(name)
  x = num;
  namex = name;
  while(used) {
    if(used === false) {
      userNames[x] = namex;
      // console.log(num, name);
      // console.log(userNames);
      break;
    }
    x++;
    namex = "User" + x.toString();
    used = checkUserName(name) 
  }
  userNames[x] = namex;
  // console.log("DOne");
}

function parseCookies(str){
  temp = str.split("; ");
  cookies = {};
  for(var i = 0; i < temp.length; i++){
    var val = temp[i].split('=');
    cookies[val[0]] = val[1];
  }
  // console.log(cookies);
  return cookies;  
}

function uniqueUsername(str, num) {
  unique = true;
  for (var key in userNames) {
    if(userNames[key] == str){
      unique = false
    }
  }
  if(unique == false) {
    return false;
  }
  else{
    userNames[num] = str;
    return true;
  }
}

// function isNewUser(cookies){
//   var newUser = true;
//   for(var key in cookies) {
//     if (key == 'userId') {
//       newUser = false;
//     }
//   }
//   return newUser;
//   // if (newUser === true) {
//   //   console.log("New User");
//   //   // res.cookie ("userId", nextUser, { maxAge: 60 * 60 * 1000})
//   //   // name = "User" + nextUser.toString();
//   //   // nextUser++;
//   //   // name = assignUserName(name, nextUser);
//   //   // console.log("In cookie", cookies[io]);
//   //   // io.to(cookies[io]).emit('userName');
//   //   // console.log("Username is: ", assignUserName(name, nextUser));
//   // }
//   // if (newUser === false) {
//   //   console.log("Old User");
//   // }
// }

app.get('/', (req, res) => {
  // console.log("IN APP");
  cookies = req.cookies
  var newUser = true;
  for(var key in cookies) {
    if (key == 'userId') {
      newUser = false;
    }
  }
  if (newUser === true) {
    console.log("New User")
    res.cookie ("userId", nextUser, { maxAge: 60 * 60 * 1000})
    name = "User" + nextUser.toString();
    name = assignUserName(name, nextUser);
    nextUser++;
  }
  // if (newUser === false) {
  //   console.log("Old User");
  // }
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
  console.log('a user connected');
  var cookief = socket.handshake.headers.cookie;
  cookies = parseCookies(cookief);
  num = cookies["userId"];
  num = num.toString()
  // console.log("Name: ", userNames[num]);
  if(userNames[num] != undefined) {
    io.to(socket.id).emit('userName', userNames[num]);
  }
  // console.log(cookies["userId"]);
  // newUser = isNewUser(cookies);
  // if(newUser) {
  //   console.log("New");
  //   name = "User" + nextUser.toString();
  //   // nextUser++;
  //   // name = assignUserName(name, nextUser);
  //   console.log(name);
  // }
  socket.on('disconnect', () => {
      console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
      // console.log('message: ' + msg);
      message = msg.split(' ');
      command = message[1]
      if(command == "/name"){
        name = msg.split("/name ");
        if(uniqueUsername(name[1], num)){
          io.to(socket.id).emit('userName', name[1]);
        }
      }
      else if(command === "/color") {
        color = msg.split("/color ");
        console.log(color[1].length);
        var re = /[0-9A-Fa-f]{6}/g;
        if(re.test(color[1]) && (color[1].length == 6)){
          colors[num] = color[1];
          console.log(colors);
        }
        else{
          console.log("NOT VALID HEX");
        }
      }
      // else{
      //   socket.broadcast.emit('chat message', msg);
      // }
  });
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

http.listen(3000, () => {
  console.log('listening on *:3000');
});

app.use(express.static(path.join(__dirname, "static")));
