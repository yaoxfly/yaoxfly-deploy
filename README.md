[English](README.md) | [中文](README-CN.md)
 
# @yaoxfly/deploy
Automatically package the project, compress the target folder or file, upload it to the specified directory of the remote server and automatically decompress it, support multiple environment configurations, provide the function of uploading the specified environment, and also provide the backup and restore function, which can specify the environmen.

>environment：The target files or folders uploaded to different servers or different paths of the same server can be simply understood as development, test, formal and other environments.

# install
```js
npm i  @yaoxfly/deploy -g

// Run the yx-deploy -V command to check the version number and check whether the installation is successful

```

# configure
Add a profile at the root path `yx.deploy.config`

Single environment configuration

```js

module.exports = {
  //Server connection -- Required
  connect: {
    host: 'Host ip',
    port: 'SSH connection port', //It's usually 22,  
    username: 'User name',
    password: 'User login password'
  },

  //Upload -- Required
  upload: {
    name: 'File name or directory name',   //For example 'dist'
    path: 'The uploaded file or directory is relative to the path of the yx.deploy.config configuration file. If it is a file, the suffix is required', //For example './dist' 
    remotePath: 'Directory to upload to the server' //For example '/home/'
  },

  //Packaging - Optional projects that need to be packaged before uploading can be configured, such as front-end project npm run build
  build: {
    command: "Pack command to execute - Empty does not pack",
  },

  //Backup -- Optional
  backup: {
    open: true, //Enabling the Backup function
    outputDir: 'backup', //If the backup output directory is not created, it is automatically created in the root directory. Multi-level directories cannot be created
    quantity: 5 //Keep only the latest five versions. If the current configuration is deleted or the value is set to false or 0, it indicates no limit
  }
}
```


Multi-environment configuration

```js 
module.exports = [
  {
    //Environment Configuration -- Required
    env: {
      name: 'Environment name', // For example dev
      description: 'Environment description' //For example Development environment -- can be empty
    },

    // Server Connection -- Required
    connect: {
      host: 'Host ip',
      port: 'SSH connection port', //It's usually 22,  
      username: 'User name',
      password: 'User login password'
    },

 // Upload -- Required
    upload: {
      name: 'File name or directory name',   //For example 'dist'
      path: 'The uploaded file or directory is relative to the path of the yx.deploy.config configuration file. If it is a file, the suffix is required', //For example './dist' 
      remotePath: 'Directory to upload to the server' //For example '/home/'
    },

   // Packaging - Optional projects that need to be packaged before uploading can be configured, such as front-end project npm run build
    build: {
      command: "Pack command to execute - Empty does not pack",
    },

   // Backup -- Optional
    backup: {
      open: true, //Enabling the Backup function
      outputDir: 'backup', //If the backup output directory is not created, it is automatically created in the root directory. Multi-level directories cannot be created
      quantity: 5 //Keep only the latest five versions. If the current configuration is deleted or the value is set to false or 0, it indicates no limit
    }
  }
]
```

# upload

 Upload files/folders to the server. In multiple environments, you will be asked to specify an environment to upload

```js
 yx-deploy upload 
 or
 yx-deploy u //abbreviation
```

Multi-environment without asking, quickly upload to the specified environment

```js
 yx-deploy upload  --env  [Environment name]
 or
 yx-deploy u -e  [Environment name] //abbreviation
```

> The server needs to install `unzip`,otherwise, the decompression fails。


# Backup Restore

You can select the most recently uploaded version to restore. In multiple environments, you will be asked to specify an environment to restore

```js
 yx-deploy revert 
 or
 yx-deploy r //abbreviation
```

Quickly restore to the latest version

```js
 yx-deploy revert --latest 
 or
 yx-deploy r -l //abbreviation
```


Quickly restore to an environment without asking for multiple environments

```js
 yx-deploy revert --env [Environment name]
 or
 yx-deploy r -e [ Environment name ]  //abbreviation
```

> The current function needs to be in the `yx.deploy.config` configuration file with `backup.open` set to `true` and `backup.outputDir` needs to be configured.

# support

 Fully supported on the `LTS` version of `Node.js`. And it needs at least `v12`.
