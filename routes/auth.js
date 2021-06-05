const express=require('express');
const router=express.Router();
const nodemailer=require('nodemailer');
const jwt=require('jsonwebtoken');
const {google}=require('googleapis');
const OAuth2 = google.auth.OAuth2;
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";
const userModel=require('../models/Schema/userSchema');
const bcrypt=require('bcrypt');
const passport=require('passport')
const guest=require('../middleware/guest');


const checkEmail=(req,res,next)=>{
    var name=req.body.name;
    var lname=req.body.lname;
    var phone=req.body.phone;
    var email=req.body.email;
    var password=req.body.password;
    var confpassword=req.body.confpassword;
    let errors=[]
    var checkExistUname= userModel.findOne({email:email})
    checkExistUname.exec((err,data)=>{
        if(err) throw err;
        if(data){
            errors.push({msg:"Email is already registerd !"})
            return res.render('register',{errors:errors,name:name,lname:lname,phone:phone,password:password,confpassword:confpassword})     
        }
        next();
    })
}


router.post('/login',(req,res,next)=>{
    let email=req.body.email;
    let password=req.body.password;
    if(!email || !password){
        req.flash('error_msg',"All Fields required");
        res.redirect('/login');
      
    }
    else{
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
}
})
router.get('/login',guest,(req,res,next)=>{
    res.render('login')
})
router.get('/logout',(req,res,next)=>{
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
})
router.get('/register',guest,(req,res,next)=>{
    res.render('register')
})
router.post('/register',checkEmail,(req,res,next)=>{
    var name=req.body.name;
    var lname=req.body.lname;
    var phone=req.body.phone;
    var email=req.body.email;
    var password=req.body.password;
    var confpassword=req.body.confpassword;
    let errors=[];
    if(!name || !lname || !phone || !email || !password || !confpassword){
        errors.push({msg:"All Fields required"});
    }
    if(password != confpassword ){
        errors.push({msg:"Password did not match"});
    }
     if(password.length <8){
        errors.push({msg:"Password must be minimum 8 character"})
    }

    if(errors.length > 0){
res.render('register',{errors:errors,name:name,lname:lname,phone:phone,email:email,password:password,confpassword:confpassword})
    }
    else{
        const oauth2Client = new OAuth2(
            "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
            "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
            "https://developers.google.com/oauthplayground" // Redirect URL
        );
    
        oauth2Client.setCredentials({
            refresh_token: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w"
        });
        const accessToken = oauth2Client.getAccessToken()
        const token=jwt.sign({name,lname,phone,email,password},JWT_KEY,{expiresIn:'30m'})
        const CLIENT_URL='http://'+req.headers.host;
        
        const output=` 
        <img src="cid:image1@e-learning.com" width="100%">
        <h2>Please click on below link to activate your account</h2>
        <p>${CLIENT_URL}/activate/${token}</p>
        <p><b>NOTE: </b> The above activation link expires in 30 minutes.</p>`
        const transporter=nodemailer.createTransport({
            service:'gmail',
            auth:{
                type: "OAuth2",
                user: "nodejsa@gmail.com",
                clientId: "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
                clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
                refreshToken: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
                accessToken: accessToken
            }
        })

        const mailOptions={
            from: '"E-Learning " <nodejsa@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Account Verification: NodeJS Auth ✔", // Subject line
        generateTextFromHTML: true,
        html: output, // html body
        attachments:[{
            filename : 'email_verification.png',
            path: './public/images/email_verification.png',
            cid : 'image1@e-learning.com'
        }]
        }
        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                req.flash('error_msg','Something went wrong on our end. Please register again.')
                res.redirect('/login')
            }
            else{
console.log('mail sent %s',info.response);
req.flash('success_msg','Activation link sent to email ID. Please activate to log in.')
res.redirect('/login');
            }
            res.redirect('/login');
        })
    }
})

router.get('/activate/:token',(req,res,next)=>{
const token=req.params.token;
if(token){
jwt.verify(token,JWT_KEY,(err,decodedToken)=>{
    if(err){
        req.flash('error_msg',"Incorrect or expired link! Please register again")
        res.redirect('/register');
    }
    else{
const userdata=new userModel({
     name:decodedToken.name,
     lname:decodedToken.lname,
     email:decodedToken.email,
     phone:decodedToken.phone,
     password: bcrypt.hashSync(decodedToken.password,10)
})
userdata.save((err,doc)=>{
    if(err){
        req.flash("error_msg","Something went wrong on our side");
        res.redirect("/login");
    }
    else{
        req.flash('success_msg','Account activated. You can now log in.')
        res.redirect('/login')
    }
})
    }
})
}
else{
        req.flash('error_msg',"Incorrect or expired link! Please register again")
        res.redirect('/register');
}
})

router.get('/forgot',guest,(req,res,next)=>{
    res.render('forgot')
})

router.post('/forgot',(req,res,next)=>{
const email=req.body.email;
let errors=[];
if(!email){
errors.push({msg:'please enter email id'});
}
if(errors.length > 0){
    res.render('forgot',{errors:errors})
}
else{
    const userdata =userModel.findOne({email:email})
userdata.exec((err,user)=>{
if(!user){
    errors.push({msg:'User with this Email ID does not exist!'})
    res.render('forgot',{errors:errors,email:email});
}
else{
    const oauth2Client = new OAuth2(
        "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
        "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
        "https://developers.google.com/oauthplayground" // Redirect URL
    );

    oauth2Client.setCredentials({
        refresh_token: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w"
    });
    const accessToken = oauth2Client.getAccessToken()
   const token= jwt.sign({id:user._id},JWT_RESET_KEY,{expiresIn:'30m'});
   const CLIENT_URL="http://" +req.headers.host;
   const output=`
   <img src="cid:image1@e-learning.com" width="100%" height="400px">
    <h2> Please click on below link to reset your account password</h2>
           <p>${CLIENT_URL}/forgot/${token}</p>
           <p><b>NOTE: </b> The activation link expires in 30 minutes.</p>
           `;
           user.updateOne({resetlink:token},(err,success)=>{
            if(err){
                errors.push({ msg: 'Error resetting password!' });
                res.render('forgot', {
                    errors,
                });
               }
               else{
                const transport=nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: "OAuth2",
                        user: "nodejsa@gmail.com",
                        clientId: "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
                        clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
                        refreshToken: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
                        accessToken: accessToken
                    },
                   })
                   const mailOptions = {
                    from: '" E- Learning" <nodejsa@gmail.com>', // sender address
                    to: email, // list of receivers
                    subject: "Account Password Reset: NodeJS Auth ✔", // Subject line
                    html: output, // html body
                    attachments:[{
                        filename : 'forgot.jpg',
                        path: './public/images/forgot.jpg',
                        cid : 'image1@e-learning.com'
                    }]
                    };
         transport.sendMail(mailOptions,(err,info)=>{
            if(err){
                console.log(err);
                req.flash('error_msg','Something went wrong on our end! Try again');
                res.redirect('/forgot');
            }
            else{
                console.log("mail sent %s",info.response)
                req.flash('success_msg','Password reset link sent to email ID. Please follow the instructions.')
                res.redirect('/login');
            }
        })
        }
        });
        }
    });
}
})

router.get('/forgot/:token',(req,res,next)=>{
    var token=req.params.token
    if(token){
        jwt.verify(token,JWT_RESET_KEY,(err,decodedToken)=>{
            if(err){
                req.flash('error_msg','Incorrect or expired link! Please try again')
                res.redirect('/forgot');
            }
            else{
                const id=decodedToken.id;
                const userdata=userModel.findById(id)
                userdata.exec((err,doc)=>{
                    if(err){
                        req.flash('error_msg','User with email ID does not exist! Please try again.')
                        res.redirect('/login');
                    }
                    else{
                        res.redirect(`/reset/${id}`);
                    }
                })
            }
        })
    }
})
router.get('/reset/:id',guest,(req,res,next)=>{
const id=req.params.id;
res.render('reset',{id:id});
})

router.post('/reset/:id',(req,res,next)=>{
    const password=req.body.password;
    const confpassword=req.body.confpassword;
    const id=req.params.id
    if(!password || !confpassword){
        req.flash('error_msg','Please enter all field');
        res.redirect(`/reset/${id}`);
    }
    if(password !=confpassword){
        req.flash('error_msg','Password did not match!!')
        res.redirect(`/reset/${id}`);
    }
    else{
        var encryptpassword=bcrypt.hashSync(password,10);
        userModel.findByIdAndUpdate(id,{password:encryptpassword},(err,doc)=>{
            if(err){
                req.flash('error_msg','Error resetting password!');
                res.redirect(`/reset/${id}`);
            }
            else{
                req.flash('success_msg','Password updated Successfully');
                res.redirect('/login');
            }
        })
    }
})
module.exports=router;