const express = require('express')
const socket = require('socket.io')
const cors = require('cors')
const bodyParser = require('body-parser')
const validator = require('express-validator')
const app = express()
const server = require('http').Server(app)
const io = socket(server)

const port = process.env.PORT || 3001
const route = require('./app/routes')

app.use(cors())

app.use((req,res,next) => {
  req.io = io
  next()
})

app.use(bodyParser.json())
app.use(validator())
app.use(route)

server.listen(port, () => {
  console.log('Listening on '+port)

  const users = [];
  const onlineUsers = [];
  const messages = [];

  io.on("connection", (socket) => {
    console.log("New client connected");
    // Send online users list
    io.emit('guests.show', users);
    // Send messages history
    io.emit('messages.show', messages);
    // Storage current user
    var storageUser;
    //  
    socket.on('guest.new', user => {
      io.emit('guest.show', user);
      users.push(user);
      onlineUsers.push(user);
      storageUser = user;
    });
    // 
    socket.on('message.new', message => {
      const subject = { ...message, date: new Date() };
      io.emit('message.show', subject);
      messages.push(subject);
    });
    // 
    socket.on('disconnect', () => {
      console.log('Client disconnected:', { storageUser });
      // Remove user from list
      if (!storageUser) return;
      const userIndex = onlineUsers.findIndex(el => el.name === storageUser.name);
      if (userIndex > -1) onlineUsers.splice(userIndex, 1);
    });
  });

})