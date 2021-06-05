const express=require('express')
const router=express.Router();
const fast2sms=require('fast-two-sms');
const stripe=require('stripe')('sk_test_51Isr7mSGYjYnomPVVm9owzZDTMe39XeEx3fPE3Ocf3BoapdsOyHfUERbYe5scMBb41bKSyJp2liKzYODfiiYMkRg00dvyRwg9o')


router.post('/create-order', (req,res)=>{
    const CLIENT_URL='http://'+req.headers.host;
    let message= `Dear ${req.user.name} ${req.user.lname}
Thanks for shopping with us. Your ${req.body.course} Course is purchased Successfully. We will get back to you soon when new batches started.
Regards E-Learning`
    var options = {authorization : 'YwrLif1QmVsKC0MNuIztAXqW3lGvD4Sc6HpO5xjU9heoanb28yxGdq2bOUkQuet4niM5NcrKsSjVaygH' , message : message ,  numbers : [`${req.user.phone}`]} 
 
  const token=req.body.stripeToken;
  stripe.customers.create({ 
    email: req.body.stripeEmail, 
    name: req.user.name, 
    address: { 
        line1: 'B-21 Prem Nagar-3', 
        postal_code: '110086', 
        city: 'New Delhi', 
        state: 'Delhi', 
        country: 'India', 
    } 
}) 
.then((customer) => { 

    return stripe.charges.create({ 
        amount: req.body.price *100 ,  
        source: req.body.stripeToken, 
        description:req.body.course, 
        currency: 'inr', 
    }); 
}) 
.then((charge) => { 
 
    fast2sms.sendMessage(options).then(response=>{
        console.log(response)
    })
   req.flash("success_msg","Payment Successfull, Course Purchased Suceessfully") 
    res.redirect(`/${req.body.course}`)
  

}) 
.catch((err) => { 
    res.send(err)    // If some error occurs 
}); 

});

module.exports=router;