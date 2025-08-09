const socket = io();

// Ask for username
let name;
do {
  name = prompt("Enter your name:");
} while (!name);
socket.emit("join", name);

// DOM elements
const messageInput = document.getElementById('messageInput');
const messageArea = document.querySelector('.message__area');
const chatForm = document.getElementById('chatForm');
const onlineCountBtn = document.getElementById("onlineCountBtn");
const userListEl = document.getElementById("userList");

// Handle form submit
chatForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const msg = messageInput.value.trim();

  // Send text message if not empty
  if (msg) {
    const messageObj = { user: name, message: msg };
    socket.emit("message", messageObj);
    appendMessage(messageObj, "outgoing");
  }

  // If video is selected, send it
  if (selectedVideoData) {
    socket.emit("video", selectedVideoData);
    appendVideo(selectedVideoData, "outgoing");
    selectedVideoData = null;
    videoInput.value = ""; // reset file input
  }

  messageInput.value = '';
  scrollToBottom();
});

// Append message
function appendMessage(msg, type) {
  const mainDiv = document.createElement("div");
  mainDiv.classList.add(type, "message");
  mainDiv.innerHTML = `<h4>${msg.user}</h4><p>${msg.message}</p>`;
  messageArea.appendChild(mainDiv);
  scrollToBottom();
}

// Receive messages
socket.on("message", (msg) => {
  appendMessage(msg, "incoming");
});

// Scroll to bottom
function scrollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight;
}

// Online users UI update
socket.on("update-user-list", (users) => {
  onlineCountBtn.innerText = `🟢 ${users.length} People Online`;
  userListEl.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user;
    userListEl.appendChild(li);
  });
});

// Toggle user list visibility
onlineCountBtn.addEventListener("click", () => {
  userListEl.style.display = userListEl.style.display === "none" ? "block" : "none";
});

// Emoji Picker
function toggleEmojiPicker() {
  const picker = document.getElementById('picker');
  picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
}
document.querySelector('emoji-picker').addEventListener('emoji-click', event => {
  messageInput.value += event.detail.unicode;
});

// Image upload
document.getElementById('imageInput').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64Image = reader.result;

    socket.emit('image', {
      user: name,
      image: base64Image
    });
  };

  reader.readAsDataURL(file);
});

// Append incoming image with download
socket.on('image', data => {
  if (!data || !data.user || !data.image) return;

  const div = document.createElement("div");
  div.classList.add("incoming", "message");

  const img = document.createElement("img");
  img.src = data.image;
  img.alt = "image";
  img.style.maxWidth = "200px";
  img.style.borderRadius = "10px";

  const downloadLink = document.createElement("a");
  downloadLink.href = data.image;
  downloadLink.download = "image.jpg";
  downloadLink.textContent = "⬇️ Download Image";
  downloadLink.style.display = "block";
  downloadLink.style.marginTop = "5px";

  div.innerHTML = `<h4>${data.user}</h4>`;
  div.appendChild(img);
  div.appendChild(downloadLink);
  messageArea.appendChild(div);
  scrollToBottom();
});

// Handle video upload
let selectedVideoData = null;
const videoInput = document.getElementById("videoInput");

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  if (file && file.type.startsWith("video/")) {
    const reader = new FileReader();
    reader.onload = () => {
      selectedVideoData = {
        user: name,
        video: reader.result
      };
    };
    reader.readAsDataURL(file);
  } else {
    selectedVideoData = null;
  }
});

// Append video (with download button)
function appendVideo(data, type) {
  const div = document.createElement("div");
  div.classList.add(type, "message");

  const video = document.createElement("video");
  video.controls = true;
  video.src = data.video;
  video.style.maxWidth = "250px";
  video.style.borderRadius = "10px";
  video.style.marginTop = "5px";

  const downloadLink = document.createElement("a");
  downloadLink.href = data.video;
  downloadLink.download = "video.mp4";
  downloadLink.textContent = "⬇️ Download Video";
  downloadLink.style.display = "block";
  downloadLink.style.marginTop = "5px";

  div.innerHTML = `<h4>${data.user}</h4>`;
  div.appendChild(video);
  div.appendChild(downloadLink);
  messageArea.appendChild(div);
  scrollToBottom();
}

// Receive incoming video
socket.on("video", (data) => {
  if (!data || !data.user || !data.video) return;
  appendVideo(data, "incoming");
});


