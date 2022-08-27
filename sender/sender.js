const webSocket = new WebSocket("ws://192.168.29.189:3000");

webSocket.onmessage = (event) => {
  handleSignallingData(JSON.parse(event.data));
};

function handleSignallingData(data) {
  switch (data.type) {
    case "answer":
      peerConn.setRemoteDescription(data.answer);
      break;
    case "candidate":
      peerConn.addIceCandidate(data.candidate);
  }
}

let username;
// function sendUsername() {
//   // username = document.getElementById("robot").value;
//   username = "robot";
//   // console.log("kjhjakssad", username);
//   sendData({
//     type: "store_user",
//   });
// }

function sendData(data) {
  data.username = username;
  webSocket.send(JSON.stringify(data));
}
let dc;
let localStream;
let peerConn;
var dataChannel;
function startCall() {
  // username = document.getElementById("robot").value;
  username = "robot";
  console.log("kjhjakssad", username);
  sendData({
    type: "store_user",
  });

  document.getElementById("video-call-div").style.display = "inline";

  navigator.getUserMedia(
    {
      // video: {
      //   frameRate: 24,
      //   width: {
      //     min: 480,
      //     ideal: 720,
      //     max: 1280,
      //   },
      //   aspectRatio: 1.33333,
      // },
      video: true,
      audio: false,
    },
    (stream) => {
      localStream = stream;
      document.getElementById("local-video").srcObject = localStream;

      let configuration = {
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
            ],
          },
        ],
      };

      peerConn = new RTCPeerConnection(configuration);
      peerConn.addStream(localStream);

      dataChannel = peerConn.createDataChannel("dataChannelName", {});
      dataChannel.onopen = handleDataChannelOpen;
      dataChannel.onmessage = handleDataChannelMessageReceived;
      dataChannel.onerror = handleDataChannelError;
      dataChannel.onclose = handleDataChannelClose;

      peerConn.onaddstream = (e) => {
        document.getElementById("remote-video").srcObject = e.stream;
      };

      peerConn.onicecandidate = (e) => {
        if (e.candidate == null) return;
        sendData({
          type: "store_candidate",
          candidate: e.candidate,
        });
      };

      createAndSendOffer();
    },
    (error) => {
      console.log(error);
    }
  );
  // setTimeout(() => {
  //   const dc = peerConn.createDataChannel("BackChannel");
  //   dc.addEventListener("message", (event) => {
  //     const message = event.data;
  //     // incomingMessages.textContent += message + "\n";
  //     console.log(message);
  //   });
  // }, 8000);
}
setTimeout(() => {
  startCall();
}, 1000);

function createAndSendOffer() {
  peerConn.createOffer(
    (offer) => {
      sendData({
        type: "store_offer",
        offer: offer,
      });

      peerConn.setLocalDescription(offer);
    },
    (error) => {
      console.log(error);
    }
  );
}

let isAudio = true;
function muteAudio() {
  isAudio = !isAudio;
  localStream.getAudioTracks()[0].enabled = isAudio;
}

let isVideo = true;
function muteVideo() {
  isVideo = !isVideo;
  localStream.getVideoTracks()[0].enabled = isVideo;
}
var handleDataChannelOpen = function (event) {
  // const message = " forward";
  // console.log("dataChannel.OnOpen", event);
  dataChannel.send("message started");
};

var handleDataChannelMessageReceived = function (event) {
  // console.log("dataChannel.OnMessage:", event);
};

var handleDataChannelError = function (error) {
  // console.log("dataChannel.OnError:", error);
};

var handleDataChannelClose = function (event) {
  // console.log("dataChannel.OnClose", event);
};

var handleChannelCallback = function (event) {
  dataChannel = event.channel;
  dataChannel.onopen = handleDataChannelOpen;
  dataChannel.onmessage = handleDataChannelMessageReceived;
  dataChannel.onerror = handleDataChannelError;
  dataChannel.onclose = handleDataChannelClose;
};
function sendMessage() {
  // username = document.getElementById("robot").value;
  // username = "robot";
  const message = " forward";
  dataChannel.send(message);
}
