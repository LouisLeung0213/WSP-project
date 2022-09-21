const chatForm = document.querySelector("#chat-form");
const chatMessage = document.querySelector(".chat-messages");
const socket = io.connect();

let params = new URL(document.location).searchParams;
let room_user_id = params.get("id");

let username;
let user_idJS;

async function getChatroomInfo() {
  let res = await fetch("/chatroomMessage" + location.search);
  let json = await res.json();
  if (json.isadmin) {
    targetName.textContent = json.room_username;
  }

  let check = await fetch("/checkThirdParty" + location.search);

  let checkJson = await check.json();
  console.log(checkJson);

  console.log(json);

  for (let message of json.messages) {
    outputMessage(message);
  }
  return json.room_username;
}

let room_username_p = getChatroomInfo();
// output message to DOM
async function outputMessage(message) {
  let time = new Date();
  let content = message.content;
  //   let Information = await getChatroomInfo();
  let username;
  let isadmin = message.isadmin || message.toadmin === false;
  if (isadmin) {
    username = "admin";
  } else {
    username = await room_username_p;
  }

  const div = document.createElement("div");

  div.classList.add("message");

  div.innerHTML = `<p class="meta">${username}<span class="spanMessage">${time}</span></p>
            <p class="text">
              ${content}
            </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//Message from server
socket.on("message", (message) => {
  console.log(message);

  if (message.isadmin == true) {
    message.username;
  }

  outputMessage(message);

  //scroll down
  chatMessage.scrollTop = chatMessage.scrollHeight;
});

//message Submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let room_user_id = new URLSearchParams(location.search).get("id");
  //get message text
  const msg = e.target.elements.msg.value;

  //   fetch message to database
  let res = await fetch("/chatroomMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: msg, room_user_id }),
  });

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});
