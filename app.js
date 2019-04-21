const express=require("express");
const exphbs=require("express-handlebars");
const path=require("path");
const session=require("express-session");
const bcrypt=require("bcryptjs")
const bodyParser=require("body-parser");
const flash=require("connect-flash");
const passport=require("passport");
const local=require("passport-local");
const mongoose=require("mongoose");
const {ensureAuthenticated}=require('./helpers/auth')

const app=express();

//mongooose
mongoose.Promise=global.Promise;
mongoose.connect("mongodb://koumi:koumudi4@ds139954.mlab.com:39954/dbmsp",{useNewUrlParser:true})
.then(()=>console.log("Mongoose connected"))
.catch((err)=>console.log(err));

//models importing
require("./models/Idea");
require('./models/Order');
require('./models/User');
require('./config/passport')(passport);
const Idea=mongoose.model('ideas');
const Order=mongoose.model('orders');
const User=mongoose.model('users');

//handlebars
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

//bodyparser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

//external path
app.use(express.static(path.join(__dirname,'public')))

//express-session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}))
app.use(passport.initialize());
app.use(passport.session()); 
//global variables
app.use(flash());
app.use(function(req,res,next){
  res.locals.success_msg=req.flash("success_msg");
  res.locals.error_msg=req.flash("error_msg");
  res.locals.error=req.flash("error");
  res.locals.user = req.user || null;   //if user then hide login and register
next();
})


//code
app.get('/',(req,res)=>{
  res.render("index")
})

app.get('/about',(req,res)=>{
  res.render("about")
})
app.get('/ideas/pictures1/:pId',ensureAuthenticated,(req,res)=>{
  Idea.find({
   pId:req.params.pId
  })
  .sort({date:'desc'})
  
  .then(ideas=>{
    var arr=new Array();
  
    for(var i=0;i<ideas.length;i++){
    var namex=ideas[i].name.split("/")
    arr.push(namex[2]);
    console.log(namex[2]);
    }
    //let picinfo=Object.assign({},arr,ideas);
    //console.log("hellooooooooo");
    for(var i=0;i<ideas.length;i++){
      ideas[i]["name"]=arr[i];
    }
    console.log(ideas);
    res.render("ideas/pictures1",{
    ideas:ideas,
    arr:Object.assign({},arr)

    })
    
  })
})
app.get('/ideas/add',(req,res)=>{
  res.render("ideas/add")
})

/*app.post('/ideas/pictures1',(req,res)=>{
  
  let errors=[];
  if(!req.body.name){
    errors.push({text:'Please enter name'})
  }
  if(errors.length>0){
    res.render("ideas/add",{
      errors:errors,
      name:req.body.name
    });
  }
  else{
  const newIdea={
  name:req.body.name,
  pId:req.body.pId,
  picName:req.body.picName,
  amount:req.body.amount,
  }
  console.log(req.body);
  new Idea(newIdea).save()
  .then(idea=>{
    res.redirect('/ideas/pictures1');
  })
}
})*/

app.get('/ideas/payment',ensureAuthenticated,(req,res)=>{
  Order.find({
    user:req.user.id
  })
  .sort({date:'desc'})

  .then(orders=>{
    
  var arr1=new Array();
  for(var i=1;i<orders.length;i++){
    arr1.push(orders[i]);
  }
   res.render('ideas/payment',{
     orders:orders[0].name,
    //orderpicName:orders[0]["picName"],
     order:arr1
   
   });
  })
   
  

});
app.get('/ideas/payment/img/:name',ensureAuthenticated,(req,res)=>{
  const newOrder={
    name:req.params.name,
    user:req.user.id,
    }
    console.log(req.body);
    new Order(newOrder).save()
   .then(order=>{
    req.flash("success_msg","Added to cart successfully")
     res.redirect('/ideas/payment')
   })
     
     });

   app.get('/users/registration',(req,res)=>{
     
     res.render('users/registration');
   });
   app.get('/users/login',(req,res)=>{
     res.render('users/login');
   })
   app.post('/users/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect:'/ideas/add',
      failureRedirect: '/users/login',
      failureFlash: true 
    })(req, res, next);
  });


app.post('/users/registration',(req,res)=>{
  let errors=[];
 
  if(req.body.password.length<6){
    errors.push({text:'Password must be 6 characters'})
  }
  if(req.body.password!=req.body.password2){
    errors.push({text:'Passwords do not match'})
  }
  if(errors.length>0){
    res.render('users/registration',{
      errors:errors,
      name:req.body.name,
      email:req.body.email,
      password:req.body.password,
      
    });
  }
  else{
    User.findOne({email:req.body.email
    })
    .then(user=>{
      if(user){
        req.flash("success_msg","Email already registered")
        res.redirect('/users/login')
      }
      else{
        const newUser={
          name:req.body.name,
          email:req.body.email,
          password:req.body.password,
        } 
        bcrypt.genSalt(10,(err,salt)=>{
          bcrypt.hash(newUser.password,salt,(err,hash)=>{
            if(err) throw err;
            newUser.password=hash;
            new User(newUser).save()
            .then(users=>{
              req.flash("success_msg","Registered successfully")
              res.redirect('/users/login')
            })
            .catch(err=>{
              console.log(err);
              return;
            })
          })
        })
      }
    })
    

  
  }
})

app.get('/ideas/paymentorder',ensureAuthenticated,(req,res)=>{
  req.flash("success_msg","payment successful");
  res.render('ideas/paymentorder');
})

app.get('/users/logout',ensureAuthenticated,(req,res)=>{
  req.logout();
  req.flash("success_msg","You are logged out");
  res.redirect("/users/login");
})
const port=process.env.PORT || 5000;
app.listen(port,()=>{
  console.log(`Server started in port ${port}`)
})