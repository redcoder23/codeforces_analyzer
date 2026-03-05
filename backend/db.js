const express=require('express'); 
const mongoose=require('mongoose'); 
require('dotenv').config(); 
const mongouri=process.env.MONGO_URL;
const connecttomongo=async()=>{ 
     try 
     { 
        const connect=await mongoose.connect(mongouri);  
        if(connect) 
            console.log('connected to db');
     }
     catch(error) 
     { 
       console.log('error connecting to the db:',error);
     } 
} 

module.exports=connecttomongo;