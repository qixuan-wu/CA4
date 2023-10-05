const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = 6000;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);
// We use a set to store users; sets are for unique values of any type.
const activeUsers = new Set();

io.on("connection", function (socket) {
  console.log("Made socket connection");

  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    // The spread operator '...' adds to the set while retaining its existing values.
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", function () {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  socket.on("chat message", function (data) {
    io.emit("chat message", data);
  });

  // When receiving the 'user typing' event
  socket.on('user typing', () => {
    const userName = socket.userId;
    socket.broadcast.emit('user typing', userName);
  });

  // When receiving the 'user stopped typing' event
  socket.on('user stopped typing', () => {
    const userName = socket.userId;
    socket.broadcast.emit('user stopped typing', userName);
  });
});

