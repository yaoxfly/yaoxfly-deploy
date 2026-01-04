[English](README.md) | [中文](README-CN.md)

# @yaoxfly/deploy
自动化打包项目, 压缩目标文件夹或文件，上传到远程服务器指定目录下并自动解压，支持多环境配置，提供指定环境上传的功能，还提供了备份还原功能，可指定环境、版本还原。该插件可用于自动化部署。

> 环境：目标文件或文件夹上传到不同服务器或上传到相同服务器的不同路径下，可简单理解为开发、测试、正式等环境。


# 安装
```js
npm i  @yaoxfly/deploy -g

// 执行 yx-deploy -V 看版本号，测试是否安装成功
```

# 配置 
在根路径添加配置文件,支持以下命名方式
+ `yx.deploy.config`
+ `yx.deploy.config.ts`
+ `yx.deploy.config.js`

单环境配置

```js

module.exports = {
  //服务器连接 --必填
  connect: {
    host: '主机ip',
    port: 'SSH 连接端口', //一般是22,  
    username: '用户名',
    password: '用户登录密码'
  },

  //上传 --必填
  upload: {
    name: '文件名称或者目录名称',   //例如 'dist'
    path: '上传的文件或者目录相对yx.deploy.config配置文件的路径，如果是文件需要后缀名', //例如 './dist' 
    remotePath: '上传到服务器的目录' //例如 '/home/'
  },

  //打包 --可选 上传前需要打包的工程可以配置,  例如前端工程 npm run build。
  build: {
    command: "打包执行的命令 --为空不会进行打包操作",
  },

  //备份 --可选
  backup: {
    open: true, //开启备份功能。
    outputDir: 'backup', //备份输出目录,如果没有创建，会自动在根目录下创建,不可创建多级目录。
    quantity: 5 //只保留最新的5个版本，去掉当前配置或设置为false、0 则表示无限制。
  },

  //压缩 --可选 仅压缩功能使用
  compress: {
    type: 'zip' // 压缩类型：zip、tar、tgz
  }
}
```


多环境配置

```js 
module.exports = [
  {
    //环境配置 --必填
    env: {
      name: '环境名称', // 例如 dev
      description: '环境描述' //例如 开发环境 --可为空
    },

    //服务器连接 --必填
    connect: {
      host: '主机ip',
      port: 'SSH 连接端口', //一般是22,  
      username: '用户名',
      password: '用户登录密码'
    },

    //上传 --必填
    upload: {
      name: '文件名称或者目录名称',   //例如 'dist'
      path: '上传的文件或者目录相对yx.deploy.config配置文件的路径，如果是文件需要后缀名', //例如 './dist' 
      remotePath: '上传到服务器的目录' //例如 '/home/'
    },

    //打包 --可选 上传前需要打包的工程可以配置,  例如前端工程 npm run build。
    build: {
      command: "打包执行的命令 --为空不会进行打包操作",
    },

    //备份 --可选
    backup: {
      open: true, //开启备份功能。
      outputDir: 'backup', //备份输出目录,如果没有创建，会自动在根目录下创建,不可创建多级目录。
      quantity: 5 //只保留最新的5个版本，去掉当前配置或设置为false、0 则表示无限制。
    },

    //压缩 --可选 仅压缩功能使用
    compress: {
      type: 'zip' // 压缩类型：zip、tar、tgz
    }
  }
]
```

# 上传

 上传文件/文件夹到服务器，多环境下会询问指定某个环境上传

```js
 yx-deploy upload 
 or
 yx-deploy u //缩写
```

多环境不询问，快捷上传到指定环境

```js
 yx-deploy upload  --env  [环境名称]
 or
 yx-deploy u -e  [环境名称] //缩写
```

> 服务器需要安装`unzip`,否则解压不成功。


# 备份还原

可选择最近上传的版本还原，多环境下会询问指定某个环境还原

```js
 yx-deploy revert 
 or
 yx-deploy r //缩写
```

快速还原到最新版本

```js
 yx-deploy revert --latest 
 or
 yx-deploy r -l //缩写
```


多环境不询问，快捷还原到某个环境

```js
 yx-deploy revert --env [环境名称]
 or
 yx-deploy r -e [环境名称] //缩写
```


> 当前功能需在`yx.deploy.config`配置文件中，配置`backup.open`为`true`，并且需要配置`backup.outputDir`。


# 压缩

仅压缩文件/文件夹，不进行上传操作

```js
 yx-deploy compress 
 or
 yx-deploy c //缩写
```

指定源目录进行压缩

```js
 yx-deploy compress --source [源目录路径]
 or
 yx-deploy c -s [源目录路径] //缩写
```

指定压缩类型

```js
 yx-deploy compress --type [压缩类型]
 or
 yx-deploy c -t [压缩类型] //缩写
```

指定输出目录

```js
 yx-deploy compress --output [输出目录路径]
 or
 yx-deploy c -o [输出目录路径] //缩写
```

使用配置文件中的压缩设置

```js
 yx-deploy compress --file
 or
 yx-deploy c -f //缩写
```

使用示例

 + 直接传参（不使用配置文件）

 ```js
  yx-deploy compress -s ./dist -t zip -o ./output
  // 缩写形式
  yx-deploy c -s ./dist -t zip -o ./output
 ```

 + 使用配置文件（启用配置文件读取）

 ```js
  yx-deploy compress -f
  // 缩写形式
  yx-deploy c -f
 ```

 + 交互式询问（不传任何参数）

 ```js
  yx-deploy compress
  // 缩写形式
  yx-deploy c
 ```

 > 压缩功能支持优先级：直接传参 > 配置文件（当启用时）> 询问用户


# 查看版本和帮助

查看版本号

```js
 yx-deploy -V
 or
 yx-deploy --version
```

查看主命令帮助

```js
 yx-deploy -h
 or
 yx-deploy --help
```

查看具体命令帮助

```js
 yx-deploy upload --help
 yx-deploy revert --help
 yx-deploy compress --help
 or
 yx-deploy u -h
 yx-deploy r -h
 yx-deploy c -h
```

查看所有命令的缩写形式帮助

```js
 yx-deploy u --help
 yx-deploy r --help
 yx-deploy c --help
 or
 yx-deploy upload -h
 yx-deploy revert -h
 yx-deploy compress -h
```


# 支持

 在 `LTS` 版本的 `Node.js` 上完全支持。并且至少需要`v12`。