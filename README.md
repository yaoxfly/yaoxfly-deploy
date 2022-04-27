# @yaoxfly/deploy
上传文件/文件夹到服务器，自动化部署。  


# 安装

全局下载

```
npm i  @yaoxfly/deploy -g
```

需要`ts-node`支持，全局下载

```
npm i  ts-node -g
```

# 配置
在根路径添加配置文件`deploy.js`

```js

module.exports = {
  //服务器连接 
  connect: {
    host: '主机ip',
    port: 'SSH 连接端口' //一般是22,  
    username: '用户名', 
    password: '用户登录密码'
  },

  //上传
  upload: {
    name: '文件名称或者目录名称',   //例如 dist
    path: '上传的文件或者目录 ，相对配置文件(deploy.js)的路径' //例如 /dist , 
    remotePath: '上传到服务器的目录' //例如 /home/,
  },

  //打包 --上传前需要打包的工程可以配置这个，把个配置去掉上传功能也可执行
  build: {
    command: "打包执行的命令 --为空不打包", 
  }
}
```


>  服务器需要安装unzip,否则解压不成功

