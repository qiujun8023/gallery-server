### 1、项目介绍

##### 1.1 用途

> 使用 UpYun 存储的在线相册

##### 1.2 特性

* 使用 UpYun 存储，支持防盗链，无需数据库
* 自动读取照片信息（ISO、时间等）
* 可自定义封面图、名称、描述以及回答问题后访问
* 自适应瀑布流展示方式

##### 1.3 [演示>>](https://gallery.qiujun.me/)

### 2、Docker 部署

##### 2.1 依赖

* docker
* docker-compose

##### 2.2 拉取应用配置文件

```bash
wget https://raw.githubusercontent.com/qious/gallery-server/master/config/default.json -O config.json
```

##### 2.3 修改应用配置文件

> [配置文件说明>>](#配置文件说明)

```bash
vim config.json
```

##### 2.4 配置 docker-compose

```bash
cat > ./docker-compose.yml << \EOF
version: '3'
services:
  redis:
    image: redis:3
    restart: always
  server:
    image: qious/gallery-server
    restart: always
    depends_on:
      - redis
    volumes:
      - ./config.json:/app/config/local.json:ro
  client:
    image: qious/gallery-client
    restart: always
    ports:
      - "8888:80"
    depends_on:
      - server
EOF
```

* 运行
```bash
docker-compose up -d
```

* 访问
```
curl http://localhost:8888
```

### 3、配置文件说明


| 字段   | 必填   | 描述   |
|:----|:----|:----|
| debug   | 是   | 调试模式   |
| server.host   | 是   | 监听IP，Docker 部署请使用 0.0.0.0   |
| server.port   | 是   | 监听端口，与 docker-compose 配置文件对应   |
| server.baseUrl   | 是   | 外部访问地址，形如 [https://example.com/](https://example.com/)   |
| server.title   | 是   | 网站标题   |
| keys[0]   | 是   | 用来机密 Cookie 的随机字符串   |
| keys[1]   | 是   | 用来机密 Cookie 的随机字符串   |
| redis.host   | 是   | Redis 地址   |
| redis.port   | 是   | Redis 端口   |
| redis.keyPrefix   | 是   | Redis 键前缀   |
| upyun.bucket   | 是   | 又拍云 bucket   |
| upyun.operator   | 是   | 又拍云操作员名称   |
| upyun.password   | 是   | 又怕云操作员密码   |
| upyun.token   | 否   | 又拍云防盗链 Token，可不填   |
| albums.[dir]   | 否   | [dir]为又怕云对应目录名称   |
| albumes.[dir].name   | 否   | 对 [dir] 展示时进行重命名   |
| albums.[dir].description   | 否   | 对 [dir] 的描述   |
| albums.[dir].question   | 否   | 将 [dir] 设置为回答问题可见   |
| albums.[dir].answer   | 否   | [dir] 问题的答案   |
| albums.[dir].thumbnails   | 否   | [dir] 展示时的缩录图，图片需存在 [dir] 中   |
| albums.[dir].items   | 否   | [dir] 中的子相册   |
