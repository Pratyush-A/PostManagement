const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.set('view engine', 'ejs')

const User = require('./models/usermodel')
const Post = require('./models/postmodel')


app.use(express.urlencoded({ extended: true }))  // for form data
app.use(express.json())

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.listen(3000,(req,res)=>{
  console.log('Server is running on port 3000')
})


app.post("/users/create",async(req,res)=>{
    let {name,email,age,password}=req.body
    let userexists=await User.findOne({email})

    if(userexists){
        return res.status(400).send("User already exists")
    }

    const salt=await bcrypt.genSalt(10)
    let hashedpassword=await bcrypt.hash(password,salt)
    password=hashedpassword
    let user=await User.create({name,email,age,password})
    console.log(user)
    res.redirect('/')
})

app.get("/users",async(req,res)=>{
    let users=await User.find()
    res.render('users.ejs',{users})
})

app.get("/login",(req,res)=>{
    res.render('login.ejs')
})

app.post("/login",async(req,res)=>{
    let {email,password}=req.body
    let user = await User.findOne({email})
    if(!user){
        return res.send("Something went wrong")
    }
    else{
        let compare=await bcrypt.compare(password,user.password)
        if(compare){
            let token=jwt.sign({email},'secretkey',{expiresIn:'5m'})
            
            res.cookie('token',token)
            isLoggedIn
            res.redirect('/dashboard/'+user._id)
        }
        else{
            res.send("Something went wrong")
        }
    }
})

app.get("/dashboard/:id",isLoggedIn,async(req,res)=>{
    let {id}=req.params
    let user=await User.findById(id)
    let name=user.name
    res.render('dashboard.ejs',{user})
})

app.get("/dashboard/posts/:id",async(req,res)=>{
    let {id}=req.params
    let user=await User.findById(id)
    let posts=user.posts
    console.log(posts)
    let postdata=[]
    for(let i=0;i<posts.length;i++){
        let post=await Post.findById(posts[i])
        postdata.push(post)
    }
    console.log("User Post Details")
    console.log(postdata)
    res.render('posts.ejs',{postdata,user})
})

app.get('/delete/:id/:postid',async(req,res)=>{
    let {id,postid}=req.params
    await Post.findByIdAndDelete(postid)
    let user=await User.findById(id)
    user.posts=user.posts.filter((post)=>post!=postid)
    await user.save()
    res.redirect('/dashboard/posts/'+id)
})

app.get('/logout',(req,res)=>{
    res.cookie('token',"")
    res.redirect('/')
})

app.get("/post/create/:id",async (req,res)=>{
    let {id}=req.params
    let user=await User.findById(id)
    res.render('createpost.ejs',{user})
})

app.post("/post/create/:id",async (req,res)=>{
    let {id}=req.params
   let {content}=req.body
   let post=await Post.create({
    postdata:content,
    user:id
   })
   let user=await User.findById(id)
   user.posts.push(post._id)
    await user.save()
    if(req.cookies.token)
    {
        res.redirect('/dashboard/posts/'+id)
    }
    else{
   res.redirect('/users')
    }
})


function isLoggedIn(req,res,next){
    if(req.cookies.token==="" || req.cookies.token==undefined){
        res.send("You are not logged in")
    }
    else{
        jwt.verify(req.cookies.token,'secretkey',(err,decoded)=>{
            if(err){
                res.send("Session expired login again")
            }
            else{
                console.log(decoded)
                next()
            }   
        })
    }
}