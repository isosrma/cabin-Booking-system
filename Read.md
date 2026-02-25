# HTTP METHOD

1)GET ->Server ma data pathauney 
2)POST ->server bata data launey ;id needed
3)PUT  ->data update ;id needed
4)PATCH  ->data update ;id needed
5)DELETE--->data delete ;id needed




# FOLDER STRUCTURE 
MODE ->data schema 
CONTROLER->Business  logic 
Routers->Route provide 
MIDDLEWARE->
UTILS->

# REST API
Strictly follow The HTTP method 

Import garney 3 tarika 

Common js ->const express = require("express");
modern js ->imposr express from "express"

    "dev": "nodemon src/app.js"
  "type": "module",


user.controller.js
user.routes.js

yesarii lekhney 
installing express ,dotenv ,api , getmethod,server;



# Prisma installing 


npm install prisma@6 --save-dev

npm install @prisma/client@6

#Neon db
- create a new project ->click new string -> copy link 
-This copy link is stored in the .env folder with :DATABASE_URL = "COPYED LINK ".

-npx prisma init :It creates a prisma folder in the backend folder 

-prisma folder -->schema.prisma ma ---> update --->provider = "prisma-client-js"
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL"),
}

model User {
  id Int @id @default(autoincrement())
  name String
  email String @unique
}

()
-npx prisma migrate dev --name qwe
-npx prisma migrate dev --name init


database.js 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); 
    }
};

export default prisma;



# Middleware 
 route---> middleware--> controller 


# migrate 
npx prisma migrate dev --name add_post
npx prisma generate



#
multer initialize 


# Register Login 

controller  
const { } = req.body 

check user alrady exist 

password = consirm password 

prisma.user.create {
  data {
    
  }
}


#authentication 


#Forget password, verify otp , password reset 
*Forget password->
