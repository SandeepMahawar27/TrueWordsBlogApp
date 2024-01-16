const {Router} = require("express")
const router = Router()

const {createPost, getPosts, getSinglePost, getCatPosts, getUserPosts, editPost, deletePost} = require("../controllers/postController")
const authmiddleware = require("../middlewares/authMiddleware")

router.post('/', authmiddleware,createPost)
router.get('/', getPosts)
router.get('/:id', getSinglePost)
router.get('/categories/:category', getCatPosts)
router.get('/users/:id', getUserPosts)
router.patch('/:id', authmiddleware, editPost)
router.delete('/:id', authmiddleware, deletePost)

module.exports = router