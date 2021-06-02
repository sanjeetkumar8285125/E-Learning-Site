const express=require('express')
const router=express.Router();
const stripe=require('stripe')('sk_test_51Isr7mSGYjYnomPVVm9owzZDTMe39XeEx3fPE3Ocf3BoapdsOyHfUERbYe5scMBb41bKSyJp2liKzYODfiiYMkRg00dvyRwg9o')
router.post('/create-order', (req,res)=>{
 console.log(req.body.price)
  const token=req.body.stripeToken;
  stripe.customers.create({ 
    email: req.body.stripeEmail, 
    name: req.user.name, 
    address: { 
        line1: 'B-21 Prem Nagr-3', 
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
   req.flash("success_msg","Payment Successfull, Course Purchased Suceessfully") // If no error occurs 
    res.redirect(`/${req.body.course}`)
}) 
.catch((err) => { 
    res.send(err)    // If some error occurs 
}); 

});

module.exports=router;