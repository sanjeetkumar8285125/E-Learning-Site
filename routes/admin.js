const express=require('express');
const router=express.Router();
const order=require('../models/Schema/orderSchema');
const admin=require('../middleware/admin')
router.get('/admin/orders',admin,(req,res,next)=>{
    order.find({status:{$ne:'completed'}},null,{sort:{createdAt:-1}}).populate('customerid','-password').exec((err,orders)=>{
        if(req.xhr){
        res.json(orders)
       }
       else{
        res.render('admin/order')
       }
        
    })
})
router.post('/admin/order/status',(req,res,next)=>{
    order.updateOne({_id:req.body.orderId},{status:req.body.status},(err,data)=>{
        if(err){
            req.flash('error_msg','Something went wrong')
            res.redirect('/admin/orders')
        }
        else{
            res.redirect('/admin/orders')
        }
    })
})

module.exports=router