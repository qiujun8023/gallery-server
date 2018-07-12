### 项目介绍

##### 用途

> 使用 UpYun 存储的在线相册

##### 依赖

* Node.js >= 7.6.0
* Redis

##### 特性

* 使用 UpYun 存储，支持防盗链，无需数据库
* 自动读取照片信息（ISO、时间等）
* 可自定义封面图、名称、描述以及回答问题后访问
* 自适应瀑布流展示方式

##### 演示

 [Demo](https://gallery.qiujun.me/)

#### 部署方式

##### 拉取最新代码

```bash
cd /path/you/want/to/deploy
mkdir gallery
cd gallery
git clone https://github.com/qious/gallery-server.git server
git clone -b dist https://github.com/qious/gallery-client.git client
```

##### 安装依赖

```bash
cd /path/to/gallery/server
npm i
sudo npm i -g pm2
```

##### 复制并修改配置文件

```bash
cd /path/to/gallery/server
cp ./config/default.json ./config/local.json
vim ./config/local.json # 根据自身需要修改配置文件
```

##### 测试运行服务端

```bash
cd /path/to/gallery/server
npm run dev # 如无报错后可进入下一步
```

##### 正式运行服务端

```bash
cd /path/to/gallery/server
npm run pm2.start
```

##### 配置Nginx，Nginx示例配置如下

```nginx
upstream gallery {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name gallery.example.com;

    root /path/to/gallery/client;
    index index.htm index.html;

    location ~ /\. {
        deny all;
    }

    location /api {
        include proxy_params;
        proxy_pass http://gallery/api;
    }

    location /static {
        expires 7d;
    }
}
```
