const express =require("express");
const router = express.Router();
const usercontroller = require('../controllers/usercontroller');

router.get("/" ,usercontroller.getindex);
router.get("/register" ,usercontroller.getRegister);
router.post("/register" ,usercontroller.postRegister);
router.get("/login" ,usercontroller.getLogin);
router.post("/login" ,usercontroller.postLogin);
router.get('/profile/:id',usercontroller.getprofile);
router.get("/logout" ,usercontroller.getLogout);
router.get("/contact",usercontroller.getContact);
//get all packages
router.get("/packages" , usercontroller.getpackages);
// website to server
router.post("/packages/purchase", usercontroller.purchasePackage);

//demand
router.post("/demand" , usercontroller.postdemand);
// //secces
// router.get("/success" , usercontroller.getsuccess);
//notification route
router.get('/notification/:id', usercontroller.getNotification);
//transaction route
router.get('/transaction/:id'  , usercontroller.gettransaction) ;
//forgot password section
router.get('/forgot-password', usercontroller.getforgotpassword);
router.post('/forgot-password', usercontroller.postforgotpassword);
router.get('/reset-password/:token', usercontroller.getResetPassword);
router.post('/reset-password/:token', usercontroller.postResetPassword);
module.exports=router;