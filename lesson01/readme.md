## 搭建一个简单的信令服务器

# 本节内容

1.使用node.js编写简单的的webrtc信令服务器能够完成视频通话

2.用Socket.IO创建消息传递服务

# 基本概念

要创建并保持WebRTC通话, 客户端之间需要互相交换元数据信息, 包括:

候选网络信息(Candidate);
媒介相关的邀请信息(Offer)和响应信息(answer), 比如分辨率(resolution), 编解码器(codec)等。

想要传输流媒体视频/数据, 必须得先互相交换元数据信息。这个过程被称为信令传输(signaling)。

# 环境准备: 安装Node.js

要运行本节和接下来的示例代码 需要在本机安装 Node.js。

Node.js中文网下载链接: http://nodejs.cn/download/;

当然也可以直接从Node.js官网下载: https://nodejs.org/en/download/。

某些平台上可以通过包管理器进行安装, 请参考: https://nodejs.org/en/download/package-manager/。

# 搭建信令服务器

本次使用 Socket.IO 作为信令服务器。

基于Socket.IO的设计, 将其用作消息服务简单又直接。 Socket.IO 非常适合用于学习WebRTC信令, 因为其内置了 “聊天室”(rooms) 这个概念。

#### socket.io

socket.io 分为服务端和客户端两部分。
服务端由 Nodejs加载后侦听某个服务端口，客户端要想与服务端相连，首先要加载 socket.io 的客户端库，然后调用 io.connect();就与服务端连上了。

index.js程序主要做两件事情：
1.作为消息中继服务器
2.管理WebRTC视频聊天室
代码非常简单，总共大约就70行。

```
var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8080);
var io = socketIO.listen(app);
io.sockets.on('connection', function(socket) {
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }
  socket.on('message', function(message) {
    log('Client said: ', message);
    socket.broadcast.emit('message', message);
  });
  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);
    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');
    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);
    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else { 
      socket.emit('full', room);
    }
  });
  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });
  socket.on('bye', function(){
    console.log('received bye');
  });

});

```

- [ ] 服务端侦听 8080这个端口，对不同的消息做相应的处理：

- 服务器收到 message 消息时，它会直接进行广播，所有连接到该服务器的客户端都会收收广播的消息。
- 服务端收到 “create or join”消息时，它会对房间里有人数进行统计，如果房间里没有人，则发送"created" 消息；如果房间里有一个人，发送"join"消息和“joined"消息；如果超过两个人，发送"full"消息。

在信令服务端的代码我们引入了 node-static 库，使服务器具有发布静态文件的功能。服务器具有此功能后，当客户端（浏览器）向服务端发起请求时，服务器通过该模块获得客户端（浏览器）运行的代码。

# 网页

如果只是为了测试我们的信令服务器能否完成功能，网页的可以设计的很简单： 主要包含两部分：html文件和js文件.以下给出html文件代码，main.js的代码文件放在本目录下code文件夹中01文件夹下

index.html文件：

```
<!DOCTYPE html>
<html>

<head>
  <title>Realtime communication with WebRTC</title>
</head>

<body>
  <h1>Realtime communication with WebRTC</h1>
  <div id="videos">
    <video id="localVideo" autoplay muted></video>
    <video id="remoteVideo" autoplay></video>
  </div>
  <script src="/socket.io/socket.io.js"></script>
  <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
  <script src="main.js"></script>
</body>
</html>
```

该代码十分简单，就是在body里引入了两段 JS 代码。socket.io.js 是用来与服务端建立 socket 连接的。main.js 的作用是做一些业务逻辑，并最终通过 socket 与服务端通讯。

# 设置 Socket.IO

在HTML文件中, 可以看到, 我们使用了一个 Socket.IO 的文件:
在index.js目录下目录中创建文件: package.json, 其内容如下:

```
{
  "name": "webrtc-codelab",
  "version": "0.0.1",
  "description": "WebRTC",
  "dependencies": {
    "node-static": "^0.7.10",
    "socket.io": "^1.2.0"
  }
}
```

这就是一个应用清单文件, 主要是告知Node包管理器需要安装的依赖项。

# 运行

打开命令终端，进入上文中信令服务器index.ja所在文件目录，执行以下命令：

```
node index.js
```

服务器启动完成后, 请打开浏览器, 输入地址, 如: http://localhost:8080。

然后继续打开第二个标签页/新窗口, 输入地址: http://localhost:8080。 则页面中会显示两个video元素, 第一个展示 getUserMedia() 获取到的本地视频,第二个则展示 RTCPeerconnection 传输过来的远程视频，运行结果如图所示。
![Image text](https://github.com/HelloWorldCN/webrtc_edu/blob/master/images/01.png)

因为程序逻辑简单, 如果刷新或者关闭了客户端标签页, 则需要重启 Node.js 才能继续使用。

# 小结

以上介绍了如何使用 sokcet.io 构建 WebRTC 信令消息服务器。socket.io 由于有房间的概念所以与WebRTC非常匹配，用它开发WebRTC信令服务器非常方便。

另外，在本文中的例子只是一个简单例子并没有太多的实际价值。

## 参考文献

1. [WebRTC samples](https://webrtc.github.io/samples/)

1. [codelab WebRTC](https://codelabs.developers.google.com/codelabs/webrtc-web/)
