# 本节内容
基于WebRTC实现桌面共享
## 介绍
webRTC中的 getDisplayMedia()模块提供了捕获桌面和捕获窗口的相关功能，而实现远程桌面共享功能需要将 getDisplayMedia() 捕获的画面作为peerconnection的视频源，原理和视频通话的原理相似。
## getDisplayMedia()
这个 MediaDevices  接口的 getDisplayMedia() 方法提示用户去选择和授权捕获展示的内容或部分内容（如一个窗口）在一个  MediaStream 里. 然后，这个媒体流可以通过使用 MediaStream Recording API 被记录或者作为WebRTC 会话的一部分被传输。使用方法：
获取屏幕的方法
```
function startAction() {
  startButton.disabled = true;
  navigator.mediaDevices.getDisplayMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);
  trace('Requesting local stream.');
}
```
## HTML页面
html页面仅做展示用，可以用两个video标签来分别展示本地屏幕和远程屏幕，本节内容中，html代码和lesson03中html中基本一致。

```
<!DOCTYPE html>
<html>

<head>
  <title>Realtime communication with WebRTC</title>
  <link rel="stylesheet" href="css/main.css" />
</head>

<body>
  <h1>Realtime communication with WebRTC</h1>

  <video id="localVideo" autoplay playsinline></video>
  <video id="remoteVideo" autoplay playsinline></video>

  <div>
    <button id="startButton">Start</button>
    <button id="callButton">Call</button>
    <button id="hangupButton">Hang Up</button>
  </div>

  <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
  <script src="js/main.js"></script>
</body>
</html>

```
## RTCPeerConnection
使用webrtc进行远程视频通话或者进行共享桌面，都需要建立对等连接RTCPeerConnection，由于RTCPeerConnection建立连接的过程和远程视频通话或者进行共享桌面无关，所以我们依然可以使用上节中RTCPeerConnection建立连接的过程。

```
localPeerConnection = new RTCPeerConnection(servers);
  trace('Created local peer connection object localPeerConnection.');

  localPeerConnection.addEventListener('icecandidate', handleConnection);
  localPeerConnection.addEventListener(
    'iceconnectionstatechange', handleConnectionChange);

  remotePeerConnection = new RTCPeerConnection(servers);
  trace('Created remote peer connection object remotePeerConnection.');

  remotePeerConnection.addEventListener('icecandidate', handleConnection);
  remotePeerConnection.addEventListener(
    'iceconnectionstatechange', handleConnectionChange);
  remotePeerConnection.addEventListener('addstream', gotRemoteMediaStream);

  // Add local stream to connection and create offer to connect.
  localPeerConnection.addStream(localStream);
  trace('Added local stream to localPeerConnection.');

  trace('localPeerConnection createOffer start.');
  localPeerConnection.createOffer(offerOptions)
    .then(createdOffer).catch(setSessionDescriptionError);
```
## 原理简介
通过 RTCPeerConnection, 可以在 WebRTC 客户端之间创建连接, 来传输流媒体视频, 每个客户端就是一个端点(peer)。这个peer连接可以用来传输视频、音频等数据。     
  
值得注意的是，WebRTC 是为 peer-to-peer 网络设计的, 所以用户可以在大部分可以直连的网络中使用. 但现实情况非常复杂, WebRTC面临的真实环境是: 客户端程序需要穿透 NAT网关 ,以及各类防火墙。 所以在直连失败的情况下, peer-to-peer 网络需要一种回退措施。  
### 获取桌面内容
使用getDisplayMedia()能够获取捕获桌面内容，并且捕获的内容可以直接通过RTCPeerConnection通道进行传输。
```
navigator.mediaDevices.getDisplayMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);
```
### 将本地桌面放入RTCPeerConnection连接中
获取到的桌面媒体信息，

```
localPeerConnection.addStream(localStream);
  trace('Added local stream to localPeerConnection.');

  trace('localPeerConnection createOffer start.');
  localPeerConnection.createOffer(offerOptions)
    .then(createdOffer).catch(setSessionDescriptionError);

```

### main.js
整个main.js的代码在lesson05 code文件夹中，在该代码中，大部分内容和lesson03中代码相似，改动部分只有，在获取视频流中lesson03使用的是getusermedia（）而本节使用的是getDisplayMedia() 。  
## 效果展示
打开code中index页面，点击按钮start就会获取本地桌面，点击call就能够建立远程桌面共享。效果如下图：

![image](https://github.com/HelloWorldCN/webrtc_edu/blob/master/images/05.png?raw=true)
## 本章小结
基于WebRTC实现桌面共享，逻辑上和建立视频通话是一样的，原理也是相同，都是建立一个对等连接，将获取到的媒体信息放入传输通道中， 区别只是在获取本地媒体流的模块。
