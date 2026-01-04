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
add a configuration file in the root directory, supporting the following naming conventions.

+ `yx.deploy.config`
+ `yx.deploy.config.ts`
+ `yx.deploy.config.js`


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
  },

  //Compression -- Optional Only used for compression function
  compress: {
    type: 'zip' // Compression type: zip, tar, tgz
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
    },

    //Compression -- Optional Only used for compression function
    compress: {
      type: 'zip' // Compression type: zip, tar, tgz
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

# Compress

Compress files/folders only, without uploading

```js
 yx-deploy compress 
 or
 yx-deploy c //abbreviation
```

Specify source directory for compression

```js
 yx-deploy compress --source [source directory path]
 or
 yx-deploy c -s [source directory path] //abbreviation
```

Specify compression type

```js
 yx-deploy compress --type [compression type]
 or
 yx-deploy c -t [compression type] //abbreviation
```

Specify output directory

```js
 yx-deploy compress --output [output directory path]
 or
 yx-deploy c -o [output directory path] //abbreviation
```

Use compression settings from configuration file

```js
 yx-deploy compress --file
 or
 yx-deploy c -f //abbreviation
```

Usage examples

 + Direct parameter passing (without configuration file)

 ```js
  yx-deploy compress -s ./dist -t zip -o ./output
  // abbreviation
  yx-deploy c -s ./dist -t zip -o ./output
 ```

 + Using configuration file (enable configuration file reading)

 ```js
  yx-deploy compress -f
  // abbreviation
  yx-deploy c -f
 ```

 + Interactive inquiry (no parameters passed)

 ```js
  yx-deploy compress
  // abbreviation
  yx-deploy c
 ```

 > Compression function supports priority: direct parameter passing > configuration file (when enabled) > ask user


# View version and help

View version number

```js
 yx-deploy -V
 or
 yx-deploy --version
```

View main command help

```js
 yx-deploy -h
 or
 yx-deploy --help
```

View specific command help

```js
 yx-deploy upload --help
 yx-deploy revert --help
 yx-deploy compress --help
 or
 yx-deploy u -h
```

View help for all command abbreviations

```js
 yx-deploy u --help
 yx-deploy r --help
 yx-deploy c --help
 or
 yx-deploy upload -h
 yx-deploy revert -h
 yx-deploy compress -h
```

# support

 Fully supported on the `LTS` version of `Node.js`. And it needs at least `v12`.