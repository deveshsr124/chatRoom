const path=require('path');
const express=require('express');
const http=require('http');
const socketio=require('socket.io');
const formatMessage=require('./utils/messages');
const { userJoin,getCurrentUser,getUsersRoom,userLeave }=require('./utils/users');


const app=express();
const server=http.createServer(app);
const io =socketio(server);
const botName='chatRoom Bot';

app.use(express.static(path.join(__dirname,'public')));
 
//run when client connects

io.on('connection', socket => {
  socket.on('joinRoom',({username,room})=>{
    const user=userJoin(socket.id,username,room);
    socket.join(user.room);
    
    //welcome message
    socket.emit('message',formatMessage(botName ,'Welcome to ChatRoom !'));
    
    //boradcast when user enters
    socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

    //sends user and room 
    io.to(user.room).emit('roomUsers',{
       room:user.room,
       users:getUsersRoom(user.room)
    });
  });
  
   //listen to message
   socket.on('chatMessage',(msg)=>{
     const user=getCurrentUser(socket.id)
     io.to(user.room).emit('message',formatMessage(user.username, msg));
   });
    
   //when user disconnects
    socket.on('disconnect',()=>{
      const user=userLeave(socket.id)
      if(user){
        io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
 

      //sends user and room 
        io.to(user.room).emit('roomUsers',{
      room:user.room,
      users:getUsersRoom(user.room)
          });
      }

 
 });
 
  
});

const PORT=3000 || process.env.PORT;
server.listen(PORT ,()=> console.log(`server running at ${PORT}`));
