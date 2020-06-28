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

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on('guest.new', user => io.emit('guest.show', user));
    socket.on('message.new', message => io.emit('message.show', message));
  });
})