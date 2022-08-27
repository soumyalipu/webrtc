const webSocket = new WebSocket("ws://192.168.29.189:3000");
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
webSocket.onmessage = (event) => {
  handleSignallingData(JSON.parse(event.data));
};

function handleSignallingData(data) {
  switch (data.type) {
    case "offer":
      peerConn.setRemoteDescription(data.offer);
      createAndSendAnswer();
      break;
    case "candidate":
      peerConn.addIceCandidate(data.candidate);
  }
}

function createAndSendAnswer() {
  peerConn.createAnswer(
    (answer) => {
      peerConn.setLocalDescription(answer);
      sendData({
        type: "send_answer",
        answer: answer,
      });
    },
    (error) => {
      console.log(error);
    }
  );
}

function sendData(data) {
  data.username = username;
  webSocket.send(JSON.stringify(data));
}

let localStream;
let peerConn;
let username;

function joinCall() {
  // username = document.getElementById("username-input").value;
  username = document.getElementById("robot").value;
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
      video: false,
      audio: true,
    },
    (stream) => {
      localStream = stream;
      document.getElementById("local-video").srcObject = localStream;

      peerConn = new RTCPeerConnection(configuration);
      peerConn.addStream(localStream);
      // const dc = peerConn.createDataChannel("BackChannel");
      peerConn.ondatachannel = handleChannelCallback;
      peerConn.onaddstream = (e) => {
        document.getElementById("remote-video").srcObject = e.stream;
      };

      peerConn.onicecandidate = (e) => {
        if (e.candidate == null) return;

        sendData({
          type: "send_candidate",
          candidate: e.candidate,
        });
      };

      sendData({
        type: "join_call",
      });
    },
    (error) => {
      console.log(error);
    }
  );
  // setTimeout(() => {
  // const dc = peerConn.createDataChannel("BackChannel");
  // dc.onopen = () => {
  //   dc.send("Hello World!");
  //   console.log("Message send ");
  // };

  // dc.send("Hello susu");
  // }, 5000);
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
  // console.log("dataChannel.OnOpen", event);
  // dataChannel.send("Hello World!");
};

var handleDataChannelMessageReceived = function (event) {
  console.log(event.data);
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
