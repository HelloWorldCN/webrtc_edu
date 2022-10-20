# 本节内容
本节主要是利用webrtc实现AR模型的展示，并能够发送给远程客户，主要包括：
- canvas画布介绍
- 从画布到对等连接的流
## canvas画布
canvas 元素用于在网页上绘制图形。HTML5 的 canvas 元素使用 JavaScript 在网页上绘制图像。
画布是一个矩形区域，您可以控制其每一像素。
canvas 拥有多种绘制路径、矩形、圆形、字符以及添加图像的方法。  
canvas画布能够让开发人员在canvas标签中，绘制图形，甚至可以绘制3D模型。但是canvas无法直接作为webrtc的媒体流传输给远程。
### canvas.captureStream（）
captureStream() 方法返回的 CanvasCaptureMediaStream 是一个实时视频捕获的画布。使用方法：
```
const stream = canvas.captureStream();
```
上述代码中stream就是canvas画布捕获到的视频流。
## 使用canvans绘制一个3D模型
### 初始化3D模型
在网页中要实现3D效果主要靠使用webgl封装运行的三维引擎，在所有WebGL引擎中，Three.js是国内文资料最多、使用最广泛的三维引擎。本部分便会使用three.js绘制并展示一个3D模型，然后通过webrtc将其传输到另一个播放端。
- 首先我们需要初始化场景、一个渲染器和一个摄像机
```
scene = new THREE.Scene();
scene.background = new THREE.Color(0xfffff0);

renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true });
renderer.setSize(width, height);

const aspect = width / height;//纵横比
camera = new THREE.PerspectiveCamera(1100, aspect, 1, 10);//视距
camera.position.set(0, 0, 2);

const ambientLight = new THREE.AmbientLight(0xaaaaaa, 3);
scene.add(ambientLight);//添加环绕光
```
- 然后使用加载器加载模型
```
const loader = new THREE.GLTFLoader();
loader.load("3DSrc/chinese_knot/scene.gltf", (result) => {
    result.scene.scale.set(0.2, 0.2, 0.2);
    scene.add(result.scene);
}, undefined, (error) => {
    console.error(error);
});
```
- 初始化完成后，为了能够让模型根据鼠标的拖拽做出响应，还需要给摄像机加入旋转控制
```
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.addEventListener("changed", renderer);
```
- 最后渲染画面
```
const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};
animate();
# requestAnimationFrame()是浏览器window对象的方法,参数是将要被调用函数的函数名;
# requestAnimationFrame()调用一个函数不是立即调用而是向浏览器发起一个执行某函数的请求， 什么时候会执行由浏览器决定，一般默认保持60FPS的频率
```
### html页面
html页面只需要要创建一个canvas标签，和两个展示video的标签即可：

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

    <title>Canvas to peer connection</title>

    <link rel="icon" sizes="192x192" href="../../../images/webrtc-icon-192x192.png">
    <link href="//fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="../../../css/main.css" />
    <link rel="stylesheet" href="css/main.css" />

</head>

<body>

    <div id="container">

        <h1>
            WebRTC 展示AR物品
        </h1>
        <canvas></canvas>
        <video playsinline autoplay muted></video>

    </div>

    <script src="three.min.js"></script>
    <script src="GLTFLoader.js"></script>
    <script src="OrbitControls.js"></script>

    <script src="webgl-utils.js"></script>
    <script src="webgl-debug.js"></script>
    <script src="matrix4x4.js"></script>
    <script src="cameracontroller.js"></script>
    <script src="teapot-streams.js"></script>
    <script src="demo.js"></script>

    <script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>

    <script src="js/main.js"></script>

    <script src="../../../js/lib/ga.js"></script>
</body>

</html>
```
html页面three.min.js、GLTFLoader.js、OrbitControls.js等js文件便是本节中3D模型设计的代码具体在code中3D文件夹中，[3D模型资源来自https://sketchfab.com/]，在这里就不做过多的描述。 

## 建立peer connection
在本节中将建立两个peerconnection，一个代表本地，另一个代表远程。
```
pc1 = new RTCPeerConnection(servers);
pc2 = new RTCPeerConnection(servers);
```
在本例中, RTCPeerConnection 构造函数的 servers 参数为 null。
servers 参数中, 可以指定 STUN 和 TURN 服务器相关的信息。
## 从画布到对等连接的流
pc1调用captureStream()捕获来自canvas的画面，并将其放入连接通道。

```
const canvas = document.querySelector('canvas');
const stream = canvas.captureStream();
```

```
stream.getTracks().forEach(
      track => {
        pc1.addTrack(
            track,
            stream
        );
      }
  );
```
但是在此之前pc1和pc2会进行信令交互。  
- pc1 执行 RTCPeerConnection 的 createOffer() 方法。返回的 promise 中提供了一个 RTCSessionDescription 对象: 其中包含 pc1本地的会话描述信息:
```
 pc1.createOffer(onCreateOfferSuccess, onCreateSessionDescriptionError, offerOptions); 
```
- 如果执行成功, pc1 通过 setLocalDescription() 方法将本地会话信息保存, 接着通过信令通道, 将这些信息发送给pc2。
- pc2使用RTCPeerConnection的setRemoteDescription()方法, 将pc1传过来的远端会话信息填进去。
- pc2执行RTCPeerConnection的createAnswer()方法, 传入获取到的远端会话信息, 然后就会生成一个和Alice适配的本地会话。 createAnswer() 方法返回的 promise 会传入一个 RTCSessionDescription 对象: pc2将它设置为本地描述, 当然也需要发送给pc1。
- 当pc1获取到Bob的会话描述信息之后, 使用 setRemoteDescription() 方法将远端会话信息设置进去。




```
function onCreateSessionDescriptionError(error) {
  console.log(`Failed to create session description: ${error.toString()}`);
}

function onCreateOfferSuccess(desc) {
  console.log(`Offer from pc1\n${desc.sdp}`);
  console.log('pc1 setLocalDescription start');
  pc1.setLocalDescription(desc, () => onSetLocalSuccess(pc1), onSetSessionDescriptionError);
  console.log('pc2 setRemoteDescription start');
  pc2.setRemoteDescription(desc, () => onSetRemoteSuccess(pc2), onSetSessionDescriptionError);
  console.log('pc2 createAnswer start');
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  pc2.createAnswer(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onSetLocalSuccess(pc) {
  console.log(`${getName(pc)} setLocalDescription complete`);
}

function onSetRemoteSuccess(pc) {
  console.log(`${getName(pc)} setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error) {
  console.log(`Failed to set session description: ${error.toString()}`);
}

function gotRemoteStream(e) {
  if (video.srcObject !== e.streams[0]) {
    video.srcObject = e.streams[0];
    console.log('pc2 received remote stream');
  }
}

function onCreateAnswerSuccess(desc) {
  console.log(`Answer from pc2:\n${desc.sdp}`);
  console.log('pc2 setLocalDescription start');
  pc2.setLocalDescription(desc, () => onSetLocalSuccess(pc2), onSetSessionDescriptionError);
  console.log('pc1 setRemoteDescription start');
  pc1.setRemoteDescription(desc, () => onSetRemoteSuccess(pc1), onSetSessionDescriptionError);
}

function onIceCandidate(pc, event) {
  getOtherPc(pc).addIceCandidate(event.candidate)
      .then(
          () => onAddIceCandidateSuccess(pc),
          err => onAddIceCandidateError(pc, err)
      );
  console.log(`${getName(pc)} ICE candidate: ${event.candidate ? event.candidate.candidate : '(null)'}`);
}

```
完整代码在code中js文件夹中

## 效果展示
打开code文件中的index页面，会出现两个两个video元素，左边的代表本地，右边代表从canvas到传输过去的画面，当我们拖动左边的模型时，右边的也会随之改变。  
![06](https://github.com/HelloWorldCN/webrtc_edu/blob/master/images/06.png)
## 总结
在本节中主要是通过通过webrtc来实现canvas画布画面的传输，其本质上和webrtc的视频通话没有区别，但是本节设计3d模型和和展现方式都十分简单，感兴趣的可以尝试使用Three.js来绘制更加复杂多样的3d模型，甚至加入标记识别来展示不同模型。
