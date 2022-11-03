# 本节内容

主要讲解演示通过WebRTC在不同的客户端(peers)之间传递数据。

## HTML页面修改

在本示例中, 使用WebRTC的数据通道(data channel), 将一个 textarea 的内容, 传递给同页面中的另一个textarea。这个demo本身没什么实用价值, 主要目的是展示怎样使用WebRTC来传输数据和视频。
找到lesson03的代码, 将 index.html 文件中的 video 和 button 元素移除, 并替换为以下代码:

```
<textarea id="dataChannelSend" disabled
    placeholder="先点击[开始]按钮, 然后输入任意文字, 再点击[发送]按钮."></textarea>
<textarea id="dataChannelReceive" disabled></textarea>

<div id="buttons">
  <button id="startButton">开始</button>
  <button id="sendButton">发送</button>
  <button id="closeButton">停止</button>
</div>
```

第一个 textarea 用来输入文本,第二个则是用来展示从另一端传过来的数据。修改后的html代码如下

```
<!DOCTYPE html>
<html>

<head>

  <title>Realtime communication with WebRTC</title>

  <link rel="stylesheet" href="css/main.css" />

</head>

<body>

  <h1>Realtime communication with WebRTC</h1>

  <textarea id="dataChannelSend" disabled
      placeholder="先点击[开始]按钮, 然后输入任意文字, 再点击[发送]按钮."></textarea>
  <textarea id="dataChannelReceive" disabled></textarea>

  <div id="buttons">
    <button id="startButton">开始</button>
    <button id="sendButton">发送</button>
    <button id="closeButton">停止</button>
  </div>

  <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
  <script src="js/main.js"></script>

</body>

</html>
```

## main.js

js代码中，本节使用的是上节内容的main.js代码
这种大量粘贴代码的方式, 在示例教程中并不是很理想的做法, 但没有办法, 因为 RTCPeerConnection 要跑起来就需要依赖这么多东西。

### 在客户端之间传输数据

- 打开 index.html,
- 点击 Start 按钮, 以建立对等连接,
- 然后在左边的文本框之中输入一些字符,
- 点击 Send 按钮, 将文本通过 WebRTC 的数据通道传送出去。

## 工作原理

本节中的代码, 大部分和上节的 RTCPeerConnection 示例是相同的。

新增的代码主要集中在 sendData() 和 createConnection() 函数中:

```
function createConnection() {
  dataChannelSend.placeholder = '';
  var servers = null;
  pcConstraint = null;
  dataConstraint = null;
  trace('Using SCTP based data channels');
  // For SCTP, reliable and ordered delivery is true by default.
  // Add localConnection to global scope to make it visible
  // from the browser console.
  window.localConnection = localConnection =
      new RTCPeerConnection(servers, pcConstraint);
  trace('Created local peer connection object localConnection');

  sendChannel = localConnection.createDataChannel('sendDataChannel',
      dataConstraint);
  trace('Created send data channel');

  localConnection.onicecandidate = iceCallback1;
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  // Add remoteConnection to global scope to make it visible
  // from the browser console.
  window.remoteConnection = remoteConnection =
      new RTCPeerConnection(servers, pcConstraint);
  trace('Created remote peer connection object remoteConnection');

  remoteConnection.onicecandidate = iceCallback2;
  remoteConnection.ondatachannel = receiveChannelCallback;

  localConnection.createOffer().then(
    gotDescription1,
    onCreateSessionDescriptionError
  );
  startButton.disabled = true;
  closeButton.disabled = false;
}

function sendData() {
  var data = dataChannelSend.value;
  sendChannel.send(data);
  trace('Sent Data: ' + data);
}
```

RTCDataChannel 其提供了 send() 方法与 message 事件, 使用的语法和 WebSocket类似。

请注意 dataConstraint 的使用。数据通道可以通过配置, 来传递各种类型特征的数据 —— 比如, 可靠性优先还是效率优先. 更多的信息请参考MDN上的文档: [https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createDataChannel](https://note.youdao.com/) 。

## 效果展示

左边的文本框之中输入一些字符,
点击 Send 按钮, 将文本通过 WebRTC 的数据通道传送出去。
[![2MMESP.png](https://github.com/HelloWorldCN/webrtc_edu/blob/master/images/04.png?raw=true)

# 总结

在本节课程中, 我们学习了:

在两个WebRTC客户端之间创建连接。
在客户端之间传输文本数据。
