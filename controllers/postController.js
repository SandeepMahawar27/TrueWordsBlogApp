const Post = require("../modles/postModel")
const User = require("../modles/userModel")
const path = require('path')
const fs = require("fs")
const {v4: uuid} = require("uuid") 
const httpError = require("../modles/errorModel")

// ++++++++++++++ CREATE A POST
// POST : api/posts
//  PROTECTED
const createPost = async (req, res, next) => {
    try{
       let {title, category, description} = req.body
       if(!title || !category || !description || !req.files){
         return next(new httpError("Fill in all fields and choose thumbnail.", 422))
       }
       const {thumbnail} = req.files
       //check the file size
       if(thumbnail.size > 200000){
        return next(new httpError("Thumbnail too big. FIle should be less than 2mb."))
       }
       let fileName = thumbnail.name;
       let splittedFileName = fileName.split(".");
       let newFileName = splittedFileName[0] + uuid() + "." + splittedFileName[splittedFileName.length - 1]
       thumbnail.mv(path.join(__dirname, "..", "/uploads", newFileName), async (err) => {
        if(err){
            return next(new httpError(err))
        }else{
            const newPost = await Post.create({title, category, description, thumbnail: newFileName, 
                creator: req.user.id}) 
            if(!newPost){
                return next(new httpError("Post couldn't be created.", 422))
            }
            //find user and increate post count by 1
            const currentUser = await User.findById(req.user.id)
            const userPostCount = currentUser.posts + 1; 
            await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})

            res.status(200).json(newPost);
        }
     })     
    }catch(err){ 
      return next(new httpError(err))
    } 
}
 
// ++++++++++++++ Get A POSTS 
// GET : api/posts
//  PROTECTED
const getPosts = async (req, res, next) => {
    try{
        const posts = await Post.find().sort({updateAt: -1})
        res.status(200).json(posts)
    }catch(err){
        return next(new httpError(err));
    }
}

// ++++++++++++++ GetSingle A POST 
// GET : api/post
//  PROTECTED
const getSinglePost = async (req, res, next) => {
    try{
        const postId = req.params.id;
        const posts = await Post.findById(postId)
        if(!posts){
            return next(new httpError("Post Not Found.", 404))
        }
        res.status(200).json(posts)
    }catch(err){
        return next(new httpError(err));
    }
}

// ++++++++++++++  GET pOSTS BY CATEGORYS
// GET : api/posts/category/:category
//  UNPROTECTED
const getCatPosts = async (req, res, next) => {
    try{
       const {category} = req.params;
       const catPosts = await Post.find({category}).sort({createdAt: -1});
       res.status(200).json(catPosts);
    }catch(err){
        return next(new httpError(err));
    }
}

// ++++++++++++++  GET AUTHOR POST
// GET : api/posts/users/:id
//  UNPROTECTED
const getUserPosts = async (req, res, next) => {
    try{
        const {id} = req.params;
        const posts = await Post.find({creator: id}).sort({createdAt: -1})
        res.status(200).json(posts);
    }catch(err){
        return next(new httpError(err))
    }
}

// ++++++++++++++  EDIT POSTS
// PATCH : api/posts/:id
//  PROTECTED
const editPost = async (req, res, next) => {
    try {
        let fileName;
        let newFileName;
        let updatedPost;
        const postId = req.params.id;
        let { title, category, description } = req.body;

        if (!title || !category || description.length < 12) {
            return next(new httpError("Fill in all fields.", 422));
        }

        // get old post from database 
        const oldPost = await Post.findById(postId);

        if (req.user.id == oldPost.creator) {
            if (!req.files) {
                updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description }, { new: true });
            } else {
                // delete old thumbnail from upload
                fs.unlink(path.join(__dirname, "..", 'uploads', oldPost.thumbnail), async (err) => {
                    if (err) {
                        console.error('Error deleting old thumbnail:', err);
                        return next(new httpError(err));
                    }
                });

                // upload new thumbnail
                const { thumbnail } = req.files;
                // check file size
                if (thumbnail.size > 200000) {
                    return next(new httpError("Thumbnail too big. Should be less than 2mb"));
                }

                fileName = thumbnail.name;
                let splittedFileName = fileName.split('.');
                newFileName = splittedFileName[0] + uuid() + "." + splittedFileName[splittedFileName.length - 1];
                thumbnail.mv(path.join(__dirname, '..', 'uploads', newFileName), async (err) => {
                    if (err) {
                        console.error('Error uploading new thumbnail:', err);
                        return next(new httpError(err));
                    }
                });

                updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description, thumbnail: newFileName },
                    { new: true });
            }
        }

        if (!updatedPost) {
            return next(new httpError("Couldn't update post", 500));
        }

        res.status(200).json(updatedPost);
    } catch (err) {
        console.error('Error updating post:', err);
        return next(new httpError(err));
    }
}


// ++++++++++++++  DELETE POSTS
// Delete : api/posts/:id
//  PROTECTED
const deletePost = async (req, res, next) => {
    try{
       const postId = req.params.id
       if(!postId){
        return next(new httpError("Post unavailable", 400))
       }
       const post = await Post.findById(postId);
       const fileName = post?.thumbnail;
       if(req.user.id == post.creator){
       //delete thumbnail form uploads  folder
       fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
        if(err){
            return next(new httpError(err));
        }else{
            await Post.findByIdAndDelete(postId);
            // find user and reduce post count by 1
            const currentUser = await User.findById(req.user.id)
            const userPostCount = currentUser?.posts - 1;
            await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})
            res.json(`Post ${postId} deleted successfully.`)
           }
       })
    }else{
          return next(new httpError("Post couldn't be deleted", 403))       
    }
    }catch(err){
        return next(new httpError(err))
    } 
}

module.exports = {createPost, getPosts, getSinglePost, getCatPosts, getUserPosts, editPost, deletePost}
