# @yaoxfly/deploy
上传文件/文件夹到服务器，自动化部署。  


# 安装
```js
npm i  @yaoxfly/deploy -g
// 执行 yx-deploy -V 看版本号，测试是否安装成功
```

> 如果局部安装，只能在package.json scripts配置执行命令才能执行，配置方法往下拉。


需要`ts-node`支持，全局下载 

```js
npm i  ts-node -g
```

# 配置 
在根路径添加配置文件`yx.deploy.config`

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
    path: '上传的文件或者目录 ，相对配置文件(yx.deploy.config)的路径' //例如 /dist , 
    remotePath: '上传到服务器的目录' //例如 /home/,
  },

  //打包 --上传前需要打包的工程可以配置这个,  例如vue前端工程 npm run build，把当前配置都去掉，上传功能也可执行。
  build: {
    command: "打包执行的命令 --为空不会进行打包操作", 
  }
}
```

> 一定要配置当前文件

# 执行 

```js
 yx-deploy upload 
 or
 yx-deploy u //缩写
```

或者可以在 package.json scripts配置 `"deploy": "./node_modules/.bin/yx-deploy upload"` 然后执行

```js
 npm  run  deploy
```

> 服务器需要安装`unzip`,否则解压不成功

