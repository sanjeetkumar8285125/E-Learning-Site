const mongoose=require('../connection');
const Schema=mongoose.Schema;
const booksSchema=new Schema({
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
const booksModel= mongoose.model('book',booksSchema)
module.exports=booksModel;