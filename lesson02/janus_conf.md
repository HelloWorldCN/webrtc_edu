# 本节内容
一个开源WebRTC网关的部署
## janus介绍
Janus 是由Meetecho设计和开发的开源、通用的基于SFU架构的WebRTC流媒体服务器，它支持在Linux的服务器或MacOS上的机器进行编译和安装。由于Janus 是使用C语言进行编写的，因此它的性能十分优秀
## janus安装部署
### 安装环境  
janus可以安装在linux系统中，centos、ubuntu等都可以，本节使用的是ubuntu 16.04的系统
### 安装依赖
在安装janus之前需要安装一系列的依赖
#### 安装基础软件

```
sudo apt‐get install git
 sudo aptitude install libjansson‐dev libssl‐dev libsrtp‐dev libsofia‐s
ipua‐dev libglib2.0‐dev \
 libopus‐dev libogg‐dev libcurl4‐openssl‐dev \
 liblua5.3‐dev libconfig‐dev pkg‐config gengetopt libtool automake cmak
e unzip wget

 sudo apt‐get install apt‐transport‐https ca‐certificates
 sudo apt install cmake
 sudo apt‐get install gtk‐doc‐tools
```
####  安装libnice

```
 sudo git clone https://gitlab.freedesktop.org/libnice/libnice
 cd libnice
 sudo ./autogen.sh
 sudo ./configure ‐‐prefix=/usr
 sudo make && sudo make install
```
#### 安装libsrtp

```
1 git clone https://github.com/cisco/libsrtp
2 cd libsrtp‐master
3 sudo ./configure ‐‐prefix=/usr ‐‐enable‐openssl
4 sudo make shared_library && sudo make install
```
#### 安装usrsctp

```
1 sudo git clone https://github.com/sctplab/usrsctp
2 cd usrsctp
3 sudo ./bootstrap
4 sudo ./configure ‐‐prefix=/usr && sudo make && sudo make install
```
#### 安装libwebsockets

```
1 sudo git clone https://github.com/warmcat/libwebsockets.git
2 cd libwebsockets
3 sudo mkdir build
4 cd build
5 sudo apt‐get install cmake
6 sudo cmake ‐DLWS_MAX_SMP=1 ‐DCMAKE_INSTALL_PREFIX:PATH=/usr ‐DCMAKE_C_
FLAGS="‐fpic" ..
7 sudo make && sudo make install
```
### 安装Janus

```
1 sudo git clone https://github.com/meetecho/janus‐gateway.git
2 cd janus‐gateway
3 sudo aptitude install libmicrohttpd‐dev libjansson‐dev \
4 libssl‐dev libsrtp‐dev libsofia‐sip‐ua‐dev libglib2.0‐dev \
5 libopus‐dev libogg‐dev libcurl4‐openssl‐dev liblua5.3‐dev \
6 libconfig‐dev pkg‐config gengetopt libtool automake
7 sudo ./configure ‐‐prefix=/home/ubuntu/janus/build
8 sudo make
9 sudo make install
10 //修改配置文件
11 sudo ./configure ‐‐disable‐websockets ‐‐disable‐data‐channels ‐‐disabl
e‐rabbitmq ‐‐disable‐mqtt
```
### 修改videoRoom的配置文件

```
1 vi /home/ubuntu/janus/build/etc/janus/janus.jcfg
2
3 nat: {
4 turn_server = "127.0.0.1"
5 turn_port = 3478
6 turn_type = "udp"
7 turn_user = "XXXX"
8 turn_pwd = "XXXX"
9 ice_enforce_list = "eth0"
10
11 nat_1_1_mapping = "47.91.23.199"
12 ice_enforce_list = "eth0"
13 }
```
### certbot HTTPS证书

```
1 sudo apt install snapd
2 sudo snap install ‐‐classic certbot
3 sudo certbot ‐‐nginx
4
5 删除证书
6 sudo certbot delete
7
8 如果没有lsb
9 sudo apt‐get install lsb‐core
```

### 安装nginx

```
sudo apt‐get install nginx‐full
2 参考附件修改 nginx 的配置，参考文末的样例
3 cd /etc/nginx/sites‐available/
4 sudo cp default default.bak
5 sudo vi default
```

### 配置nginx

```
1 server {
2 root /home/ubuntu/janus/my/new_html;
3 index videoroom_vp3.html;
4
5 server_name XXXXXXXXXX; # managed by Certbot
6
7 location / {
8 # First attempt to serve request as file, then
9 # as directory, then fall back to displaying a 404.
10 try_files $uri $uri/ =404;
11 }
12
13 location /janus {
14 proxy_pass http://127.0.0.1:8088/janus;
15 }
16
17 location /admin {
proxy_pass http://127.0.0.1:7088/admin;
19 }
20
21 # cebort证书
22 listen [::]:443 ssl ipv6only=on; # managed by Certbot
23 listen 443 ssl; # managed by Certbot
24 ssl_certificate /etc/letsencrypt/live/us‐live1.smart‐leaping.com/full
chain.pem; # managed by Certbot
25 ssl_certificate_key /etc/letsencrypt/live/us‐live1.smartleaping.
com/privkey.pem; # managed by Certbot
26 include /etc/letsencrypt/options‐ssl‐nginx.conf; # managed by Certbot
27 ssl_dhparam /etc/letsencrypt/ssl‐dhparams.pem; # managed by Certbot
28 }
```

### 启动janus

```
cd /home/ubuntu/janus/build/bin
2 ./janus
```
![02-2](https://github.com/HelloWorldCN/webrtc_edu/blob/master/images/02-2.png)
## 总结
janus安装部署本身并不复杂，但是所需要的环境依赖较多，而且版本要求严格，很多依赖版本新或者旧都会出问题，这一点要格外注意。
