# 本节内容
coturn服务器安装
## 安装libevnet

```
sudo apt‐get install libevent‐dev
```
## 使用源码安装libevent-dev

```
cd libevent‐2.1.8‐stable
./autogen.sh
./configure && make
 sudo make install
```
## 安装coturn

```
 git clone https://github.com/coturn/coturn
 ./configure
 sudo make install
 cd /usr/local/etc
 sudo cp turnserver.conf.default turnserver.conf
```
## 签名证书
使用命令安装openssl

```
apt-get install openssl 
```

cert和pkey配置的自签名证书用Openssl命令生成:

```
openssl req -x509 -newkey rsa:2048 -keyout /etc/turn_server_pkey.pem -out /etc/turn_server_cert.pem -days 99999 -nodes 
```
## 修改配置信息

```
vi /usr/local/etc/turnserver.conf
```
打开配置文件之后，找到以下参数并根据自己网络环境修改

```
listening‐port=3478
external‐ip=[服务器的ip]
min‐port=50001
max‐port=65535
user=userName:pwd // user=turnuser1:pass023461
realm=XXXXXXX
cert=【使用openssl生成的cert的路径】
pkey=【使用openssl生成的pkey的路径】
```
启动coturn

```
sudo turnserver ‐o ‐c /usr/local/etc/turnserver.conf
```
## 总结
cotrun的配置并不难，但是要注意配置文件的修改，要根据自己网络环境的实际情况设置