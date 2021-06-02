const express=require('express')
const app=express()
const path=require('path')
const bodyParser = require('body-parser')
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport')
const MongoStore = require('connect-mongo')

const config=require('./models/config');
require('./controller/passport')(passport);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname,'public')));


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))


app.use(session({
  secret:'secret',
  resave: false,
  store:MongoStore.create({
    mongoUrl:config.dbURL,
    collectionName:'session',
    ttl: 10
  }),
  saveUninitialized: false,
  cookie:{maxAge:1000*24*60*60}

}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
  res.locals.session=req.session
  res.locals.user=req.user
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
app.use('/',require('./routes/Coursepayment'))
app.use('/',require('./routes/auth'));
app.use('/',require('./routes/admin'));
app.use('/',require('./routes/index'))

app.listen(process.env.PORT || 3000,(err)=>{
  if(err){
console.log("error in server");
  }
  else{
console.log("Server is running on port 3000")
  }
})