const express=require('express'); 
const mongoose=require('mongoose'); 
const Userschema=new mongoose.Schema 
({
   handle:{type:String,required:true,unique:true},  
   lastsyncedsubmissionid:{type:Number,default:0},
   isDeleted:{type:Boolean,default:false}},
   {timestamps:true});  
module.exports= mongoose.model("Users",Userschema);