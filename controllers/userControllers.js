const User = require("../modles/userModel")
const httpError = require("../modles/errorModel");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require("fs");
const path = require("path");
const {v4: uuid} = require("uuid");

// ++++++++++++++++ Register a new User
// POST : api/users/register
// UNPROTECTED
const registerUser = async (req,res,next) => {
   try{
       const {name,email,password, password2} = req.body;
       if(!name || !email || !password){
        return next(new httpError("Fill in all fields.", 422))
       }
       const newMail = email.toLowerCase() 

       const emailExists = await User.findOne({email: newMail})
       if(emailExists){
        return next(new httpError("Email Already Exists.", 422))
       }

       if((password.trim()).length < 6){
        return next(new httpError("Password should be at least 6 character.", 422))
       }

       if(password != password2){
        return next(new httpError("password does not match.", 422))
       }

       const salt = await bcrypt.genSalt(10)
       const hashPass = await bcrypt.hash(password, salt);
       const newUser = await User.create({name,email: newMail, password: hashPass})
       res.status(201).json(`newUser ${newUser.email} registered`);    

   }catch(err){
      return next(new httpError("User rgistration faild.", 422))
   }
}

// ++++++++++++++++ Login a Register User
// POST : api/users/login
//PROTECTED

const loginUser = async (req,res,next) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return next(new httpError("Fill in all Field", 422))
        }
        const newEmail = email.toLowerCase();

        const user = await User.findOne({email: newEmail})
        if(!user){
            return next(new httpError("Invalid credentials.", 422))
        }

        const comparePass = await bcrypt.compare(password, user.password)
        if(!comparePass){
            return next(new httpError("Invalid credentials.", 422));
        }

        const { _id: id, name} = user;
        const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: "1d"})

        res.status(200).json({token,id,name})
    }
    catch(err){
        return next(new httpError("login Field. Please Check your credantials", 422));
    }
}

// ++++++++++++++++ USER Profile
// GET : api/users/:id
// PROTECTED

const getUser = async (req,res,next) => {
    try{
        const {id} = req.params;
        const user = await User.findById(id).select('-password');

        if(!user) {
            return next(new httpError("User not Found", 404))
        }
        res.status(200).json(user)
    }catch(err){
        return next(new httpError(err))
    }
}

// ++++++++++++++++ GET Authors
// get : api/users/authors
// UNPROTECTED

const getAuthors = async (req,res,next) => {
    try{
        const author = await User.find()
        res.json(author)
    }catch(err){
      return next(new httpError(err))
    }
}

// ++++++++++++++++ Change user Avatar(profile picture)
// POST : api/users/change-avatar
// PROTECTED

const changeAvatar = async (req,res,next) => {
    try{
        if(!req.files.avatar){
            return next(new httpError("Please choose an Image", 422))
        }
    // find user for database
    const user = await User.findById(req.user.id);
    // delete old avatar if exists
    if(user.avatar){
        fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err) => {
            if(err){
                return next(new httpError(err));
            }
        })
    }
    const {avatar} = req.files;
    //check file size
    if(avatar.size > 500000){
        return next(new httpError("Profile picture too big. Should be less then 500kb", 422))
    }
    let fileName;
    fileName = avatar.name;
    let splittedFileName = fileName.split('.')
    let newFileName = splittedFileName[0] + uuid() + '.' + splittedFileName[splittedFileName.length - 1]
    avatar.mv(path.join(__dirname, '..', 'uploads', newFileName), async (err) => {
        if(err){
            return next(new httpError(err))
        }
        const updatedAvatar = await User.findByIdAndUpdate(req.user.id, {avatar: newFileName}, {new: true})
        if(!updatedAvatar){
            return next(new httpError("Avatar couldn't be changed.", 422))
        }
        res.status(200).json(updatedAvatar)
    })
    }catch(err){ 
        return next(new httpError(err)) 
    }

    
}
// ++++++++++++++++ Edit User Details (from profile)
// pitch : api/users/edit-user
// PROTECTED

const editUser = async (req,res,next) => {
    try{
        const {name, email, currentPassword, newPassword, confirmNewPassword} = req.body;
        if(!name || !email || !currentPassword || !newPassword){
            return next(new httpError("Fill in all fields.", 422))
        }
 
        //get user from database
        const user = await User.findById(req.user.id)
        if(!user){
            return next(new httpError("User Not Found", 403));
        }

        //make sure new email doesn't already exist
        const emailExists = await User.findOne({email})
        // we want to other details with/without changing the mail (which is a unique id because we use it to login.)
        if(emailExists && (emailExists._id != req.user.id)){
            return next(new httpError("Email already exists.", 422))
        }
        // comapre current password to database password
        const validteUserPassword = await bcrypt.compare(currentPassword, user.password);
        if(!validteUserPassword){
            return next(new httpError("Invalid current password", 422))
        }

        // comapre new password 
        if(newPassword !== confirmNewPassword){
            return next(new httpError("New Password do not match.", 422))
        }

        //hash new password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        //update user info in database
        const newInfo = await User.findByIdAndUpdate(req.user.id, {name,email,password: hash}, {new: true})
        res.status(200).json(newInfo);

    }catch(err){
        return next(new httpError(err))
    }
}



module.exports = {registerUser, loginUser, getUser, changeAvatar, editUser, getAuthors}
