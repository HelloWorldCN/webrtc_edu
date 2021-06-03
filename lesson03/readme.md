# 网页上的WebRTC p2p音视频通话实验

## 准备软件及安装地址：
###### (1)node.js :(https://nodejs.org/zh-cn/)
###### (2)vscode: (https://code.visualstudio.com/)
###### (3)Chrome浏览器 :(https://www.iplaysoft.com/tools/chrome/)

## 检查安装是否成功：
###### 在CMD命令输入node –v 后回车查看返回值
###### 在CMD命令输入npm –v 后回车查看返回值
![1.png](https://www.hualigs.cn/image/6098a29d3024b.jpg)

 如上图为安装成功

## RTCPeerConnection 简介
###### 在WebRTC规范中, RTCPeerConnection用于视频流/音频流、以及数据的传输。
###### 下面的示例程序, 将会在一个页面上, 通过两个 RTCPeerConnection 对象建立一个连接通道。

### 添加video元素及控制按钮
###### 在 index.html 文件中, 配置两个 video 元素, 以及三个按钮:

```
<video id="localVideo" autoplay playsinline></video>
<video id="remoteVideo" autoplay playsinline></video>

<div>
  <button id="startButton">Start</button>
  <button id="callButton">Call</button>
  <button id="hangupButton">Hang Up</button>
</div>

```
第一个 video 元素(id="localVideo")用于展示通过 getUserMedia() 获取到的本地视频流, 第二个 video 元素(id="remoteVideo")则通过RTCPeerconnection, 接收并显示同样的视频。在实际应用中, 页面中一般都有两个 video 元素: 一个用来展示本地视频, 另一个用来播放远程传输过来的视频( 可以参考微信视频聊天界面, 其中有一大一小,两个视频展示窗口 )。

### 添加 adapter.js 兼容库
###### 在 main.js 引用的前面, 引入 adapter.js 的最新版本:

```
<script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>

```
 adapter.js 是一个适配程序, 隔离了应用程序和规范之间的变更、前缀等差异.(当然, WebRTC实现所使用的标准和协议都已经是稳定版了, 有前缀的API也没几个。)

 在本节中, 引入了 adapter.js 的最新版本。这个库对于实验和教程来说足够用了, 但如果想用于生产环境, 可能还需要进一步完善。 adapter.js 的地址为: https://github.com/webrtc/adapter, Github提供的服务让我们可以使用到最新的版本。
##### 现在, 更新 Index.html 的内容如下:

```
<!DOCTYPE html>
<html>
<head>

    <meta charset="utf-8">
    <meta name="description" content="WebRTC code samples">
    <meta name="viewport" content="width=device-width, user-scalable=yes, initial-scale=1, maximum-scale=1">
    <meta itemprop="description" content="Client-side WebRTC code samples">
    <meta itemprop="image" content="../../../images/webrtc-icon-192x192.png">
    <meta itemprop="name" content="WebRTC code samples">
    <meta name="mobile-web-app-capable" content="yes">
    <meta id="theme-color" name="theme-color" content="#ffffff">

    <base target="_blank">

    <title>Peer connection</title>

    <link rel="icon" sizes="192x192" href="../../../images/webrtc-icon-192x192.png">
    <link href="//fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="../../../css/main.css"/>
    <link rel="stylesheet" href="css/main.css"/>

</head>

<body>

<div id="container">
    <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a>
        <span>Peer connection</span></h1>

    <p>This sample shows how to setup a connection between two peers using
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection">RTCPeerConnection</a>.
    </p>

    <video id="localVideo" playsinline autoplay muted></video>
    <video id="remoteVideo" playsinline autoplay></video>

    <div class="box">
        <button id="startButton">Start</button>
        <button id="callButton">Call</button>
        <button id="hangupButton">Hang Up</button>
    </div>

</div>

<script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
<script src="js/main.js" async></script>

<script src="../../../js/lib/ga.js"></script>
</body>
</html>

```





## 下面是对代码进行详细的讲解：

### 1.拨打视频:
###### 浏览器中通过http协议打开 index.html页面, 单击 Start 按钮获取摄像头的视频, 之后点击 Call 按钮来建立对等连接(peer connection)。 如果连接成功, 那么就可以在两个 video 中中看到同样的画面. 请打开浏览器的控制台, 查看 WebRTC 相关的日志信息。
### 2.原理简介:
#### [1] 通过 RTCPeerConnection, 可以在 WebRTC 客户端之间创建连接, 来传输流媒体视频, 每个客户端就是一个端点(peer)。
##### 本节的示例中, 两个 RTCPeerConnection 对象在同一个页面中: 即 pc1 和 pc2。 所以并没有什么实际价值, 只是用来演示api的使用。
##### 在 WebRTC 客户端之间创建视频通话, 需要执行三个步骤:
  (1)为每个客户端创建一个 RTCPeerConnection 实例, 并且通过 getUserMedia() 获取本地媒体流。  
  (2)获取网络信息并发送给对方: 有可能成功的连接点(endpoint), 被称为 ICE 候选。  
  (3)获取本地和远程描述信息并分享: SDP 格式的本地 media 元数据。

#### [2]假设 Alice 和 Bob 想通过 RTCPeerConnection 进行视频聊天。
##### 首先, Alice 和 Bob 需要交换双方的网络信息。 “寻找候选” 指的是通过 ICE 框架来查找可用网络和端口信息的过程。 可以分为以下步骤:
 (1)Alice 创建一个 RTCPeerConnection 对象, 设置好 onicecandidate 回调 [即 addEventListener('icecandidate', XXX)] 。 在 main.js 中对应的代码为:

```
let localPeerConnection;

localPeerConnection = new RTCPeerConnection(servers);
localPeerConnection.addEventListener('icecandidate', handleConnection);
localPeerConnection.addEventListener(
    'iceconnectionstatechange', handleConnectionChange);

```
 在上述代码中, RTCPeerConnection 构造函数的 servers 参数为 null。servers 参数中, 可以指定 STUN 和 TURN 服务器相关的信息。  
 
 WebRTC 是为 peer-to-peer 网络设计的, 所以用户可以在大部分可以直连的网络中使用. 但现实情况非常复杂, WebRTC面临的真实环境是: 客户端程序需要穿透 NAT网关 ,以及各类防火墙。 所以在直连失败的情况下, peer-to-peer 网络需要一种回退措施。   
 
 为了解决 peer-to-peer 直连通信失败的问题, WebRTC 通过 STUN 服务来获取客户端的公网IP, 并使用 TURN 作为中继服务器。 

 (2)Alice 调用 getUserMedia(), 将获取到的本地 stream 传给 localVideo:

```
navigator.mediaDevices.getUserMedia(mediaStreamConstraints).
  then(gotLocalMediaStream).
  catch(handleLocalMediaStreamError);
function gotLocalMediaStream(mediaStream) {
  localVideo.srcObject = mediaStream;
  localStream = mediaStream;
  trace('Received local stream.');
  callButton.disabled = false;  // Enable call button.
}
localPeerConnection.addStream(localStream);
trace('Added local stream to localPeerConnection.');

```
###### (3)在网络候选者变为可用时, 步骤1中引入的 onicecandidate 回调函数, 会被执行。
###### (4)Alice 将序列化之后的候选者信息发送给 Bob。这个过程被称为 signaling(信令), 实际应用中, 会通过消息服务来传递。 在后面的教程中会看到. 当然,在本节中, 因为两个 RTCPeerConnection 实例处于同一个页面, 所以可以直接通信, 不再需要外部消息服务。
###### (5)Bob从Alice处获得候选者信息后, 调用 addIceCandidate() 方法, 将候选信息传给 remote peer description:


```
function handleConnection(event) {
  const peerConnection = event.target;
  const iceCandidate = event.candidate;

  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    const otherPeer = getOtherPeer(peerConnection);

    otherPeer.addIceCandidate(newIceCandidate)
      .then(() => {
        handleConnectionSuccess(peerConnection);
      }).catch((error) => {
        handleConnectionFailure(peerConnection, error);
      });

    trace(`${getPeerName(peerConnection)} ICE candidate:\n` +
          `${event.candidate.candidate}.`);
  }
}
```
 WebRTC客户端还需要获取本地和远程的音频/视频媒体信息, 比如分辨率、编码/解码器的能力等等. 交换媒体配置信息的信令过程, 是通过交换元数据的blob数据进行的, 即一次 offer 与一次 answer, 使用会话描述协议(Session Description Protocol), 简称 SDP:

###### (1)Alice 执行 RTCPeerConnection 的 createOffer() 方法。返回的 promise 中提供了一个 RTCSessionDescription 对象: 其中包含 Alice 本地的会话描述信息:

```
trace('localPeerConnection createOffer start.');
localPeerConnection.createOffer(offerOptions)
  .then(createdOffer).catch(setSessionDescriptionError);
```

###### (2)如果执行成功, Alice 通过 setLocalDescription() 方法将本地会话信息保存, 接着通过信令通道, 将这些信息发送给Bob。

###### (3)Bob使用RTCPeerConnection的setRemoteDescription()方法, 将Alice传过来的远端会话信息填进去。
###### (4)Bob执行RTCPeerConnection的createAnswer()方法, 传入获取到的远端会话信息, 然后就会生成一个和Alice适配的本地会话。 createAnswer() 方法返回的 promise 会传入一个 RTCSessionDescription 对象: Bob将它设置为本地描述, 当然也需要发送给Alice。
###### (5)当Alice获取到Bob的会话描述信息之后, 使用 setRemoteDescription() 方法将远端会话信息设置进去。

```
// Logs offer creation and sets peer connection session descriptions.
function createdOffer(description) {
  trace(`Offer from localPeerConnection:\n${description.sdp}`);

  trace('localPeerConnection setLocalDescription start.');
  localPeerConnection.setLocalDescription(description)
    .then(() => {
      setLocalDescriptionSuccess(localPeerConnection);
    }).catch(setSessionDescriptionError);

  trace('remotePeerConnection setRemoteDescription start.');
  remotePeerConnection.setRemoteDescription(description)
    .then(() => {
      setRemoteDescriptionSuccess(remotePeerConnection);
    }).catch(setSessionDescriptionError);

  trace('remotePeerConnection createAnswer start.');
  remotePeerConnection.createAnswer()
    .then(createdAnswer)
    .catch(setSessionDescriptionError);
}

// Logs answer to offer creation and sets peer connection session descriptions.
function createdAnswer(description) {
  trace(`Answer from remotePeerConnection:\n${description.sdp}.`);

  trace('remotePeerConnection setLocalDescription start.');
  remotePeerConnection.setLocalDescription(description)
    .then(() => {
      setLocalDescriptionSuccess(remotePeerConnection);
    }).catch(setSessionDescriptionError);

  trace('localPeerConnection setRemoteDescription start.');
  localPeerConnection.setRemoteDescription(description)
    .then(() => {
      setRemoteDescriptionSuccess(localPeerConnection);
    }).catch(setSessionDescriptionError);
}
```


