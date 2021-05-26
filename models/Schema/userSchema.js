const mongoose=require('../connection');
const schema=mongoose.Schema;
const userSchema=new schema({
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    lname:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    phone:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        lowercase:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    resetLink: {
        type: String,
        default: ''
      },
      role: 
      { 
        type: String, 
        default: 'customer'
     }
},{timestamps:true})

const userModel=mongoose.model('user',userSchema)
module.exports=userModel;