const express = require('express');
const session = require('express-session');
const router = express.Router();
const adminController = require('../controllers/admin');
//register admin
router.get('/register' ,adminController.getAdminRegistration);
router.post('/register' ,adminController.postAdminRegistration);
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout',adminController.getLogout);
router.get('/dashboard', adminController.getDashboard);

router.post('/delete-user/:id', adminController.deleteUser);
router.get('/createPackage',adminController.getPAckages);
router.post('/create-package', adminController.createPackage);
//delete user
router.post('/delete-package/:id', adminController.deletePackage);
//show demend
router.get('/showpic/:id', adminController.showPic);
//delete demand 
router.post('/delete-demand/:id', adminController.deleteDemand);
//accept demand
router.post('/accept-demand/:id', adminController.acceptDemand);
module.exports = router;