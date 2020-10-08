const chatForm=document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');

const socket=io();

const { username , room }=Qs.parse(location.search,{
  ignoreQueryPrefix:true
})

//join chatroom 
socket.emit('joinRoom',{username,room});

//get room and users
socket.on('roomUsers',({room,users})=>{
  outputRoomName(room);
  outputUsers(users);
});

socket.on('message',message=>{
    outputMessage(message);
    
    //scroll on new messages
    chatMessages.scrollTop=chatMessages.scrollHeight;

});

//message submit
chatForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  
  const msg=e.target.elements.msg.value;
  socket.emit('chatMessage', msg);
  //clear inputs 
  e.target.elements.msg.value='';
  e.target.elements.msg.focus();
});

//Dom methods
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.username}<span>${message.time}</span></p>
     <p class="text">
       ${message.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
}

//room join function 
function outputRoomName(room){
  roomName.innerText=room;
}

//room user 
function outputUsers(users){
  userList.innerHTML=`
  ${users.map(user => `<li>${user.username}</li>`).join('')}`;
}