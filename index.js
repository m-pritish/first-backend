import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const app = express();

// using middlewares
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// setting up view engine
app.set("view engine","ejs");



mongoose
.connect("mongodb://localhost:27017", {dbName: "backend"})
.then(() => console.log("Database connected"))
.catch((e) => console.log(e))

// schema
const userSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        password: String
    }
);
const User = mongoose.model("User",userSchema);



// let users = [];
const isAuthenticated = async (req, res, next) => {
    const {token} = req.cookies;
    if(token){
        const decoded = jwt.verify(token,"hghguoshddv");
        req.user = await User.findById(decoded._id);
        next();
    }else{
        res.render("login");
    }
};






// routes
app.get("/", (req, res) => {
    res.render("index",{text:"World"});
});

app.get("/login", isAuthenticated, (req, res) => {
    res.render("logout",{userName:req.user.name});
});
app.post("/login", async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if(!user){
        return res.render("register",{email});
    }
    const isMatched = password===user.password;
    if(!isMatched){
        return res.render("login", {email, message:"Incorrect password"});
    }

    const token = jwt.sign({_id: user._id},"hghguoshddv");
    res.cookie("token", token,{
        httpOnly: true, 
        expires: new Date(Date.now()+60*1000),
    });
    res.render("logout",{userName: user.name});
})

app.get("/register", (req, res) => {
    res.render("register");
});
app.post("/register", async (req, res) => {
    const {name, email, password} = req.body;
    let user = await User.findOne({email});
    if(!user){
        // const hashedpwd = bcrypt(password,10);
        // console.log(bcrypt(password,10));
        user = await User.create({name, email, password});
    }
    res.render("login", {email});
});

app.get("/logout", (req, res) => {
    res.cookie("token", null,{
        httpOnly: true, 
        expires: new Date(Date.now()),
    });
    res.redirect("/login");
});



// app.get("/users", (req, res) => {
//     res.json({...users});
// });







// server port
app.listen(5000,() => {
    console.log("server is working");
});