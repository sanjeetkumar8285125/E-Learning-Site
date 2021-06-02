var express = require('express');
var router = express.Router();
const moment=require('moment');
const nodemailer=require('nodemailer')
const {google}=require('googleapis');
const OAuth2 = google.auth.OAuth2;
const coursesModel=require('../models/Schema/coursesSchema')
const booksModel=require('../models/Schema/BooksSchema')
const orderModel=require('../models/Schema/orderSchema');
const notesModel=require('../models/Schema/notesSchema');
const auth=require('../middleware/auth');
const stripe=require('stripe')('sk_test_51Isr7mSGYjYnomPVVm9owzZDTMe39XeEx3fPE3Ocf3BoapdsOyHfUERbYe5scMBb41bKSyJp2liKzYODfiiYMkRg00dvyRwg9o')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/notes', async function(req, res, next) {
  const notes=await notesModel.find();
//console.log(notes)
  res.render('notes',{notes:notes});
});
router.get('/books', function(req, res, next) {
  res.render('books');
});
router.get('/courses',async (req, res, next) =>{
  res.render('courses');
});
router.get('/contact', (req, res, next) =>{
  res.render('contact' );
});
router.get('/cart', (req, res, next) =>{
  res.render('customers/cart' );
});

// remove item from cart

router.get('/cart/remove/:id',(req,res,next)=>{

  let id=req.params.id;
  req.session.cart.totalQty=req.session.cart.totalQty - req.session.cart.items[id].qty ;
  req.session.cart.totalPrice=req.session.cart.totalPrice - req.session.cart.items[id].item.price * req.session.cart.items[id].qty ;
  delete req.session.cart.items[id];
  if(req.session.cart.totalQty==0){
    delete req.session.cart
res.redirect('/cart')
  }
  else{
    res.redirect('/cart')
  }
})

// store all cart items in database
router.post('/orders',auth, (req, res, next) =>{

  function renderItems(items) {
    let parsedItems = Object.values(items)
  
    return parsedItems.map((menuItem) => {
        return `
        <div>
            <img src="cid:image1@${menuItem.item.image}" alt="" width="50px" height:"50px">
            <p> <b>${ menuItem.item.name } - ${ menuItem.qty } pcs <b> </p>
            <div>
        `
    }).join('')
  }

let parsedImage = Object.values(req.session.cart.items)
const attachments = parsedImage.map((file)=>{
    return { filename: file.item.image, path: `./public/books/${file.item.image}`,cid : `image1@${file.item.image}` };
  });

  const oauth2Client = new OAuth2(
    "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
    "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
    refresh_token: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w"
});
const accessToken = oauth2Client.getAccessToken()
const CLIENT_URL='http://'+req.headers.host;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: "OAuth2",
        user: 'nodejsa@gmail.com',
        clientId: "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
        clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
        refreshToken: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
        accessToken: accessToken
    },
   });


 let {phone,address,stripeToken,paymentType}=req.body;
 if(!phone || !address){
   res.status(422).json({message:'All fields are required'})
  //  req.flash('error_msg','All fields are required');
  //  res.redirect('/cart')
 }
 else{
 const order=new orderModel({
   customerid:req.user._id,
   items:req.session.cart.items,
   phone:phone,
   address:address
 })
 order.save((err,data)=>{
   if(err){
      res.json({message:'Something went wrong'});
   }
   else{
     orderModel.populate(data,{path:'customerid'},(err,placedOrder)=>{
   if(paymentType==='card'){
     stripe.charges.create({
       amount:req.session.cart.totalPrice *100,
       source:stripeToken,
       currency:'inr',
       description:`E-Learnig Book Order: ${placedOrder._id}`
     }).then(()=>{
 placedOrder.paymentStatus=true
 placedOrder.paymentType=paymentType
  placedOrder.save().then((r)=>{
  const output = 
  `<h2 style="color:#eb690c;">Hello ${req.user.name}, </h2>
  <p style="text-align:justify">Thank you for your order. We’ll send a confirmation when your order ships. Your estimated delivery date is indicated below. If you would like to view the status of your order or make any changes to it, please visit Your Orders on <span style="color:#c24d0a"><a href="${CLIENT_URL}/customers/orders"> E-Learning </a></span></p>
  <hr>
  <h3>Order Details: -</h3>
  ${renderItems(req.session.cart.items)}
  <h3 style="color:#eb690c">Order Summary</h3>
  <hr>
  <p>Order id: #<span style="color:#405c91">${placedOrder._id} </span></p>
  <p>Placed on ${ moment(placedOrder.createdAt).format('MMMM Do YYYY, h:mm:ss a') }</p>
  <table width="50%">
  <tr>
  <td>Item Subtotal:</td>
  <td>Rs ${req.session.cart.totalPrice}</td>
  </tr>
  <tr>
  <td>Shipping & Handling:</td>
  <td>Rs 100</td>
  </tr>
  <tr>
  <td>POD Convenience Fee:</td>
  <td>Rs 0.00</td>
  </tr>
  <tr>
  <td>Shipment Total:</td>
  <td>Rs ${req.session.cart.totalPrice +100 }	</td>
  </tr>
  <tr>
  <td>Paid By Card:</td>
  <td>Rs ${req.session.cart.totalPrice +100 }	</td>
  </tr>
  </table>
  <br>
  <hr>
  <br>
  <p> If you use a mobile device, you can receive notifications about the delivery of your package and track it from our free<span style="color:#405c91";> E-Learning </span>app.<p>
  <p style="text-align:justify;">To ensure your safety, the Delivery Agent will drop the package at your doorstep, ring the doorbell and then move back 2 meters while waiting for you to collect your package. If you are in a containment zone, the agent will call you and request you to collect your package from the nearest accessible point while following the same No-Contact delivery process.</p>
  <br>
  <p>We hope to see you again soon.</p>  
  <h2>E-Learning.in</h2>  
  `
  ;
  
  const mailOptions = {
   from: `"E-Learning" <${req.user.email}>`, // sender address
   to: `${req.user.email},sanjeetkumar8285125@gmail.com`, // list of receivers
   subject: "E-Learning Your Order is placed Successfully", // Subject line
   generateTextFromHTML: true,
   html: output, // html body
   attachments:attachments
  };
  transporter.sendMail(mailOptions,(error,info)=>{
   if(error){
       console.log(error);
       res.json({message:"something went wrong"})
       
   }
   else{
       console.log('Mail sent %s',info.response);
   }
   
  })
      delete req.session.cart
    res.json({message:'Payment Successful, Order Placed Suceessfully'})
       }).catch((err)=>{
         console.log(err);
       })
     }).catch((err)=>{
      delete req.session.cart
      res.json({message:'Order Placed but Payment Failed'});
     })
     
   }
  else{  
  const output = 
  `<h2 style="color:#eb690c;">Hello ${req.user.name}, </h2>
  <p style="text-align:justify">Thank you for your order. We’ll send a confirmation when your order ships. Your estimated delivery date is indicated below. If you would like to view the status of your order or make any changes to it, please visit Your Orders on <span style="color:#c24d0a"> <a href="${CLIENT_URL}/customers/orders"> E-Learning.in</a></span></p>
  <hr>
  <h3>Order Details: -</h3>
  
  ${renderItems(req.session.cart.items)}
  <h3 style="color:#eb690c">Order Summary</h3>
  <hr>
  <p>Order id: #<span style="color:#405c91">${placedOrder._id} </span></p>
  <p>Placed on ${ moment(placedOrder.createdAt).format('MMMM Do YYYY, h:mm:ss a') }</p>
  <table width="50%">
  <tr>
  <td>Item Subtotal:</td>
  <td>Rs ${req.session.cart.totalPrice}</td>
  </tr>
  <tr>
  <td>Shipping & Handling:</td>
  <td>Rs 100</td>
  </tr>
  <tr>
  <td>POD Convenience Fee:</td>
  <td>	Rs.0.00</td>
  </tr>
  <tr>
  <td>Shipment Total:</td>
  <td>Rs ${req.session.cart.totalPrice +100 }	</td>
  </tr>
  <tr>
  <td>Paid Cash on Delivery:</td>
  <td>Rs ${req.session.cart.totalPrice +100 }	</td>
  </tr>
  </table>
  <br>
  <hr>
  <br>
  <p> If you use a mobile device, you can receive notifications about the delivery of your package and track it from our free<span style="color:#405c91";> E-Learning </span>app.<p>
  <p style="text-align:justify;">To ensure your safety, the Delivery Agent will drop the package at your doorstep, ring the doorbell and then move back 2 meters while waiting for you to collect your package. If you are in a containment zone, the agent will call you and request you to collect your package from the nearest accessible point while following the same No-Contact delivery process.</p>
  <br>
  <p>We hope to see you again soon.</p>  
  <h2>E-Learning.in</h2>  
  `
  ;
  
  
  // send mail with defined transport object
  const mailOptions = {
   from: `"E-Learning" <${req.user.email}>`, // sender address
   to: `${req.user.email},sanjeetkumar8285125@gmail.com`, // list of receivers
   subject: "E-Learning Your Order is placed Successfully", // Subject line
   generateTextFromHTML: true,
   html: output, // html body
   attachments:attachments
  };
  transporter.sendMail(mailOptions,(error,info)=>{
   if(error){
       console.log(error);
       res.json({message:"something went wrong"})
       
   }
   else{
       console.log('Mail sent %s',info.response);
   }
   
  })//end of transporter
    delete req.session.cart
    res.json({message:'Order Placed Successfully'});
  }
 
     })


   }//end of inner else
 })

} //end of outer else
});
router.get('/customers/orders',auth,async(req,res,next)=>{
  const order= await orderModel.find({customerid:req.user._id}, null ,{sort:{'createdAt': -1}});
  res.header('Cache-Control', 'no-store')
res.render('customers/orders',{orders:order,moment:moment} )
})

router.get('/customers/orders/:id',async(req,res,next)=>{
  const order=await orderModel.findById(req.params.id);
  if(req.user._id.toString() === order.customerid.toString()){
res.render('customers/singleOrder',{order:order})
  }
  else{
    res.redirect('/')
  }
})

router.post('/update-cart',(req,res)=>{
  // for the first time creating cart and adding basic object structure 
  console.log(req.body)
    if(!req.session.cart){
        req.session.cart={
            items:{},
            totalQty:0,
            totalPrice:0
        }
       
    }
    let cart=req.session.cart
    //check if item does not exist to cart
    if(!cart.items[req.body._id]){
cart.items[req.body._id]={
    item:req.body,
    qty:1
}
cart.totalQty=cart.totalQty + 1
cart.totalPrice=cart.totalPrice + req.body.price
     }
     else{
         cart.items[req.body._id].qty=cart.items[req.body._id].qty + 1
        cart.totalQty=cart.totalQty +1
        cart.totalPrice=cart.totalPrice + req.body.price
        }
    
    res.json({totalQty:req.session.cart.totalQty})
})






//courses Route
router.get('/Web%20Development', async(req, res, next) =>{
  const data=await coursesModel.find();
  res.render('web-development',{data:data[0]});
});
router.get('/Data%20Science', async (req, res, next) =>{
  const data= await coursesModel.find();
  res.render('data-science',{data:data[1]});
});
router.get('/Mobile%20App%20Development', async(req, res, next) =>{
  const data=await coursesModel.find();
  res.render('mobile-app',{data:data[2]} );
});
router.get('/Java', async(req, res, next) =>{
  const data=await coursesModel.find();
  res.render('java',{data:data[3]} );
});
router.get('/Programming%20&%20Algo',async (req, res, next) =>{
  const data=await coursesModel.find();
  res.render('Programming & Algo',{data:data[4]} );
});
router.get('/Graphic%20Designing',async (req, res, next) =>{
  const data=await coursesModel.find();
  res.render('Graphics-Designing',{data:data[5]} );
});


//Books route
router.get('/Operating%20Systems%20-%20A%20Concept%20-%20Based%20Approach%20First%20Edition', async(req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/Operating-Systems',{data:data[0]});
});
router.get('/Computer%20Networks%20%7C%20Fifth%20Edition%20%7C%20By%20Pearson%205th%20Edition',async (req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/computer network',{data:data[1]} );
});
router.get('/Python:%20The%20Complete%20Reference%20Paperback', async(req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/python',{data:data[2]} );
});
router.get('/Data%20Structures%20and%20Algorithms%20Made%20Easy', async(req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/Data Structure' ,{data:data[3]});
});
router.get('/Fundamentals%20of%20Software%20Engineering%20Paperback', async(req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/software engineering',{data:data[4]} );
});

// router.get('/c-book', (req, res, next) =>{
//   res.render('Books/C');
// });

router.get('/Object-Oriented%20Programming%20with%20C*',async (req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/Cpp',{data:data[5]});
});

router.get('/HTML%205%20Black%20Book', async(req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/html',{data:data[6]});
});

router.get('/Programming%20in%20C%20Paperback%20%E2%80%93%2025%20February%202016', async(req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/Programming in C',{data:data[7]});
});

router.get('/Beginning%20Node.js,%20Express%20&%20MongoDB%20Development', async(req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/Nodejs',{data:data[8]});
});
router.get('/Compilers:%20Principles%20Techniques%20and%20Tool',async (req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/compiler',{data:data[9]});
});

router.get(/.*Through%20Game%20Programming%20Paperback$/,async (req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/cyber security',{data:data[11]});
});
router.get('/Pro%20ASP.NET%204%20CMS',async (req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/asp-net',{data:data[12]});
});
router.get('/Unix%20Shell%20Programming%20Paperback',async (req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/unix shell',{data:data[13]});
});
router.get('/Pragmatic%20Machine%20Learning%20with%20Python',async (req, res, next) =>{
  const data= await booksModel.find();
  res.render('Books/machine learning',{data:data[14]});
});


router.post('/contact',(req,res,next)=>{
  var name=req.body.name;
  var email=req.body.email;
  var phone=req.body.phone;
  var comment=req.body.Comments;
  const oauth2Client = new OAuth2(
      "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
      "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
      "https://developers.google.com/oauthplayground" // Redirect URL
  );

  oauth2Client.setCredentials({
      refresh_token: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w"
  });
  const accessToken = oauth2Client.getAccessToken()
 

 const output = `
 <img src="cid:image1@johnson.com" width="100%">
 <p><b>Name: ${name}</b></p>
 <p><b>Customer Email id: ${email}</b></p>
 <p>phone Number: ${phone}</p>
 <p>Message: ${comment}</p>
 `;

 const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      type: "OAuth2",
      user: 'nodejsa@gmail.com',
      clientId: "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
      clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
      refreshToken: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
      accessToken: accessToken
  },
});

// send mail with defined transport object
const mailOptions = {
  from: `"E-Learning" <${email}>`, // sender address
  to: 'sanjeetkumar8285125@gmail.com', // list of receivers
  subject: "E-Learning Customer Feedback", // Subject line
  generateTextFromHTML: true,
  html: output, // html body
  attachments:[{
    filename : 'elearning-focus.jpg',
    path: './public/images/elearning-focus.jpg',
    cid : 'image1@johnson.com'
}]
};
transporter.sendMail(mailOptions,(error,info)=>{
  if(error){
      console.log(error);
       req.flash('error_msg', 'Something went wrong on our end. Please send message again.');
      res.redirect('/contact');
  }
  else{
      console.log('Mail sent %s',info.response);
      req.flash('success_msg','message sent successfully !')
      res.redirect('/contact');
  }
  res.redirect('/contact');
})
})


router.get('/about',(req,res,next)=>{
  res.render('about');
})


///Search functionality
router.get('/search',(req,res,next)=>{
var name=req.query.name;
booksModel.find({name:{$regex:name,$options:'i'}}).then((data)=>{
res.render('searchData',{data:data})
}).catch((err)=>{
  console.log(err)
})
})

router.post('/notes',(req,res,next)=>{
  var name=req.body.notes;
  notesModel.find({name:{$regex:name,$options:'i'}}).then((data)=>{
  res.render('notes',{notes:data})
  }).catch((err)=>{
    console.log(err)
  })
  })

router.get('*',(req,res,next)=>{
 res.status(404).render('error')
})
module.exports = router;
