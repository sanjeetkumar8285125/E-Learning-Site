const mongoose=require('../connection');
const Schema=mongoose.Schema;
const orderSchema=new Schema({
    customerid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    items:{
        type:Object,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    paymentType:{
        type:String,
        default:'COD'
    },
      paymentStatus:{
        type:Boolean,
        default:false
    },
    status:{
    type:String,
    default:'order_placed'
    }
},{timestamps:true})

const orderModel=mongoose.model('order',orderSchema);
module.exports=orderModel;