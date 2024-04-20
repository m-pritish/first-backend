import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from bcryptjs;

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
        email: String
    }
);
const User = mongoose.model("User",userSchema);



// let users = [];
const isAuthenticated = (req, res, next) => {
    const {token} = req.cookies;
    if(token){
        res.render("logout");
    }else{
        next();
    }
};






// routes
app.get("/", (req, res) => {
    res.render("index",{text:"Home"});
});
app.post("/contact", async (req, res) => {
    const {name, email} = req.body;
    await User
    .create({name, email})
    .then(() => {
        res.send("message sent successfully!");
    });
});





app.get("/login", isAuthenticated, (req, res) => {
    res.render("login");
});
app.post("/login", async (req, res) => {
    const {name, email} = req.body;
    const user = await User
    .create({name, email})

    res.cookie("token", user._id,{
        httpOnly: true, 
        expires: new Date(Date.now()+60*1000),
    });
    res.redirect("/login");
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