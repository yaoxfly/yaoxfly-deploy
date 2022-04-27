module.exports = {
  //服务器连接 
  connect: {
    host: 'cx-video.qjzd.net', // 主机ip
    port: 622, // SSH 连接端口
    username: 'root', // 用户名
    password: 'Cx12345678' // 用户登录密码
  },

  //上传
  upload: {
    name: 'package-lock.json',  //文件名称或者目录名称
    path: './package-lock.json', //上传的文件相对配置文件(deploy.js)的路径
    remotePath: '/home/cx/',//上传到服务器的目录
  },

  //打包
  build: {
    command: "", //打包执行的命令
  }
}