# Introduction

Nanolink has an extended GraphQl API which allows a complete integration. However it can become a large development task to implement the GraphQL api directly as it involves a lot of knowledge around GraphQL but also internal platform business logic.

As in all system integrations it is always crucial to have a stable syncronization pattern, which involves dealing with inserts, updates and deletes of data.

The project aims at making a higher level implementation and more developer friendly version of this syncronization, which means that you do not have to worry about data being syncronized on a lower level. This project keeps and maintains an open socket and will use callbacks whenever something changes. So you can just focus on what to do with those changes as they arrive.

First step to get a working "hello world" application up and running:
Make sure you have successfully installed [node](https://nodejs.org/)

From a command prompt:[
](https://nodejs.org/)

**Step 1: Clone project**

```
git clone https://github.com/nanolink/api-client-service.git
```

Step 2: 

```
cd api-client-service
npm install
```

Step 3: Open vscode

```
code .
```

Edit the vscode launchsettings inside the file .vscode/launch.json and change the two ENV variables accordingly:

*CORESERVER*

*APITOKEN*

You can find the CORESERVER string and APITOKEN string in the [Nanolink Frontend](https://www.nanolink.com/cloud/#/general/system/) in the *more* section under *system*.

If you are just using node you can create a .ENV file which holds the two ENV variables accordingly. The above launchsettings file is just for launching (F5) the project directly in vscode enabling debugging and step through breakpoints.

Currently when you hit f5 in vscode, it will run index.js which basically just starts a new instance of [ExampleApp](#exampleapp) which is just an example of how you should implement your own. We advise you to create your own index.ts (myindex.ts) and also create your own App (myapp.js) which extends the BaseApp class. The change the launchsettings file under program to start, with your own ndex file. Then whenever we make changes you can always fetch changes without overriden your own code.
