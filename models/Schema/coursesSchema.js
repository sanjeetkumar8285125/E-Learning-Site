const mongoose=require('../connection');
const Schema=mongoose.Schema;
const coursesSchema=new Schema({
name:{
    type:String,
    required:true
},
image:{
    type:String,
    required:true
},
price:{
    type:Number,
    required:true
}
})
const coursesModel= mongoose.model('course',coursesSchema)
module.exports=coursesModel;