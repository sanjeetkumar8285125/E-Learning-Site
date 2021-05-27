const mongoose=require('../connection');
const Schema=mongoose.Schema;
const notesSchema=new Schema({
    classname:{
        type:String
    },
    name:{
        type:String,
        required:true
    },
    pdflink:{
        type:String
    }
})
const notesModel=mongoose.model('notes',notesSchema)
module.exports=notesModel;