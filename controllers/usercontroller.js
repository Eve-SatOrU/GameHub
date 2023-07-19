const User = require('../models/user');
const Package = require('../models/package');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const Demand = require('../models/demand');
const Transaction = require('../models/transaction');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const { Op } = require('sequelize');
//index
exports.getindex = async(req, res, next) => {
  const user = req.session.user;
  const packages = await Package.findAll();
  const demand =await Demand.findAll();
  res.render('index', { user ,packages,demand});
}
//hashing password
User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt();
    user.userPassword = await bcrypt.hash(user.userPassword, salt);
  });
//login and register
exports.getRegister = (req, res, next) => {
    res.render('register', {
      path: '/register',
      pageTitle: 'register'
    });
  };
  function validateStrongPassword(password) {
    // Password must be at least 8 characters long
    if (password.length < 8) {
      return false;
    }
  
    // Password must contain a combination of letters, numbers, and special characters
    const letterRegex = /[a-zA-Z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*]/;
  
    if (!letterRegex.test(password) || !numberRegex.test(password) || !specialCharRegex.test(password)) {
      return false;
    }
  
    return true;
  }
  exports.postRegister = async (req, res, next) => {
      const { userName, userPassword, email, phone } = req.body;
    
      // Perform input validation
      if (!validateStrongPassword(userPassword)) {
        return res.render('register', { error: 'Password must be at least 8 characters long and contain a combination of letters, numbers, and special characters.' });
      }
    
      // Check if username or email is already taken
      const existingUser = await User.findOne({
        where: { 
          [Op.or]: [
            { userName },
            { email }
          ]
        }
      });
      if (existingUser) {
        return res.render('register', { error: 'Username or email is already taken.' });
      }
      try {
        const user = await User.create({
          userName,
          userPassword,
          email,
          phone
        });
        res.redirect('/login');
      } catch (error) {
        res.render('register', { error: 'Error creating user.' });
      }
    };
      
  exports.getLogin = (req, res, next) => {
    res.render('login', {
      path: '/login',
      pageTitle: 'login'
    });
  };
  exports.postLogin= (async (req, res) => {
    const { userName, userPassword } = req.body;
    const user = await User.findOne({ where: { userName } });
    if (!user) {
      return res.status(500).send('Something broke!');
    }
    const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isPasswordValid) {
      return res.status(500).send('your password wrong try again!');
    }
    else{
      req.session.user = user;
      req.session.userId = user.id; // Store user ID in session
      res.redirect('/');
        }
  });
  //profile
  exports.getprofile = async (req, res) => {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!req.session.user) {
      return res.redirect('/login');
    }
    res.render('profile', { user }); // passing the user object to the template
  };
    //logout
    exports.getLogout=async(req, res) => {
    //show that user in the session
    console.log("User in session:", req.session.user);
      req.session.destroy();
      res.redirect('/');
  };  
  
  //contact
  exports.getContact = async(req, res, next) => {
    const user = req.session.user;
    res.render('contact', {
      path: '/contact',
      pageTitle: 'contact',user
    });
  }
//get packages
const axios = require('axios');
const { where } = require('sequelize');

exports.getpackages = async (req, res, next) => {
  const user = req.session.user;
  try {
    const packages = await Package.findAll();

    res.render('package', {
      pageTitle: 'package',
      path: '/packages',
      packages,
      user
    });
  } catch (error) {
    console.error(error);
  }
};
//webseite nta3na => server
const playerIdPattern = /^\d{5,12}$/;
exports.purchasePackage = async (req, res) => {
  const playerID = req.body.playerID;
  const packageID = req.body.packageID;

  // Validate the player ID
  if (!playerIdPattern.test(playerID)) {
    return res.status(400).json({ error: 'Invalid player ID' });
  }

  const requestData = {
    player_id: playerID,
    item_id: packageID
  };

  const apiUrl = '';
  const apiKey = '';
  const headers = {
    'Content-Type': 'application/json',
    'authorization': apiKey
  };

  try {
    // Fetch the package details from the database
    const package = await Package.findByPk(packageID);

    const user = await User.findByPk(req.session.user.id);

    if (!package || !user) {
      return res.status(400).json({ error: 'Invalid package or user' });
    }

    // Check if the user has sufficient wallet
    if (user.wallet < package.price) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Make the POST request
    axios.post(apiUrl, requestData, { headers })
      .then(response => {
        const responseData = response.data;

            // Deduct the package price from the user's balance
            user.wallet -= package.price;
            user.save();
        // Handle the response based on the status code
        switch (response.status) {
          case 200: // Success
            console.log('Response Code:', responseData.code);
            console.log('Player Name:', responseData.player_name);
            console.log('Operation ID:', responseData.operation_id);

            // Save the transaction data to the database
            Transaction.create({
              userName: req.session.user.username,
              packageID: packageID,
              responseCode: responseData.code,
              playerName: responseData.player_name,
              operationId: responseData.operation_id,
            })
              .then(transaction => {
                console.log('Transaction saved:', transaction);

                // Second request to get operation details
                const operationId = responseData.operation_id;
                const getRequestUrl = ``;

                axios.get(getRequestUrl, { headers })
                  .then(response => {
                    const responseData = response.data;

                    // Handle the response based on the status code
                    switch (response.status) {
                      case 200: // Success or pending
                        if (responseData.status === 'success') {
                          console.log('Response Code:', responseData.code);
                          console.log('Player Info:', responseData.playerInfo);
                          console.log('Recharge Result:', responseData.rechargeResult);
                        } else if (responseData.status === 'pending') {
                          console.log('Response:', 'Still in progress');
                        }
                        break;

                      case 400: // Invalid player ID
                        // return the wallet to the user
                        user.wallet += package.price;
                        user.save();
                        console.log('Error Code:', responseData.code);
                        break;

                      case 500: // Verify payment timeout
                      // return the wallet to the user
                        user.wallet += package.price;
                        user.save();
                        console.log('Error Code:', responseData.code);
                        break;

                      default:
                      // return the wallet to the user
                        user.wallet += package.price;
                        user.save();
                        console.log('Unknown status code:', response.status);
                        break;
                    }
                  })
                  .catch(error => {
                    // Handle any error that occurred during the request
                    console.error('Error:', error.message);
                  });
              })
              .catch(error => {
                console.error('Error saving transaction:', error);
              });
            break;

          case 400: // Invalid player ID
          // return the wallet to the user
            user.wallet += package.price;
            user.save();
            console.log('Error Code:', responseData.code);
            break;

          case 401: // Insufficient balance
            // return the wallet to the user
            user.wallet += package.price;
            user.save();
            console.log('Error Code:', responseData.code);
            break;

          case 503: // No available stock
          // return the wallet to the user
          user.wallet += package.price;
          user.save();
            console.log('Error Code:', responseData.code);
            break;

          default:
            // return the wallet to the user
            user.wallet += package.price;
            user.save();
          console.log('Unknown status code:', response.status);
            break;
        }
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while purchasing the package' });
  }
};


// demand space
const upload = multer();
//in form og notification page
exports.postdemand= async (req, res) => {
    // Check if user is authenticated
    if (!req.session.user) {
      // Redirect to login page or send an error response
      return res.redirect('/login');
    }

  try {
    // Access the uploaded file data from req.file.buffer
    const imageData = req.file.buffer.toString('base64');

    // Process the imageData and save it to the database
    const {  money } = req.body;
    const userName = req.session.user.userName;
    const status = 'pending'; // Set the default status to 'pending'
    const demand = await Demand.create({
      money,
      imageData,
      userName,
      status,
    });
    req.session.user.demandId = demand.id;
    // Send response
    res.redirect(`/notification/${req.session.user.id}`);
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred while processing the file');
  }
};
//get notification
const ITEMS_PER_PAGE = 15;

exports.getNotification = async (req, res) => {
  const user = req.session.user;
  const userId = req.params.id;
  const currentPage = parseInt(req.query.page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  if (!user) {
    return res.redirect('/login');
  }

  try {
    const userData = await User.findByPk(userId);
    const userName = userData.userName;

    const { count, rows: demands } = await Demand.findAndCountAll({
      where: { userName },
      limit: ITEMS_PER_PAGE,
      offset,
    });

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

    res.render('notification', { user: userData, demands, count, currentPage, totalPages ,userId});
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while retrieving user demands');
  }
};
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

//forgot password section
exports.getforgotpassword = async (req, res) => {
  res.render('forgotpassword');
}
// Send reset password email
const apiKey = '0b15331d5297967e089f7fdbb1945c61-6d8d428c-5bb41434';
const domain = 'sandboxe8196cf5a5c24fc3aa0a293937be0803.mailgun.org';

// const mg = mailgun({ apiKey, domain });
const mg = mailgun.client({username: '6d8d428c-5bb41434', key: process.env.MAILGUN_API_KEY || '0b15331d5297967e089f7fdbb1945c61-6d8d428c-5bb41434'});
const transporter = nodemailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: 'postmaster@sandboxe8196cf5a5c24fc3aa0a293937be0803.mailgun.org	',
    pass: apiKey
  }
});

// Handle POST request to process the forgot password form
exports.postforgotpassword = async (req, res) => {
  const { email } = req.body;

  // Generate a unique password reset token with timestamp
  const timestamp = Date.now();
  const token = `${randomstring.generate({ length: 32 })}_${timestamp}`;


  const data = {
    from: 'Gaming <no-reply@accounts.gaming.com>',
    to: email,
    subject: 'Password Reset',
    text: `You can reset your password by clicking on the following link: http://localhost:3000/reset-password/${token}`,
    html: `<p>You can reset your password by clicking on the following link: <a href="http://localhost:3000/reset-password/${token}">Reset Password</a></p>`,
  };

  mg.messages.create('sandboxe8196cf5a5c24fc3aa0a293937be0803.mailgun.org', data)
    .then((msg) => {
      console.log(msg);
      // Email sent successfully, show success message or redirect to a confirmation page
      res.render('forgotpassword', { success: 'Password reset email sent. Please check your inbox.' });
    })
    .catch((err) => {
      console.log(err);
      // Error occurred while sending the email, handle the error
      res.render('forgotpassword', { error: 'Error sending email, please try again later' });
    });
};

exports.getResetPassword = (req, res) => {
  const { token } = req.params;
  
  // Check if the token is valid and not expired

  res.render('reset-password', { token });
};
//post reset password
exports.postResetPassword = async (req, res) => {
  const { email, password } = req.body;
  const { token } = req.params;

    // Extract the timestamp from the token
    const tokenParts = token.split('_');
    const timestamp = parseInt(tokenParts[tokenParts.length - 1], 10);
  
    // Check if the token is expired (5 minutes expiration)
    const expirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (Date.now() - timestamp > expirationTime) {
      // Token expired, handle the error
      return res.render('reset-password', { error: 'The password reset link has expired. Please request a new one.' });
    }
  
  try {
    // Find the user with the provided email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // User not found, handle the error (e.g., show error message or redirect back to the form)
      return res.render('reset-password', { error: 'Invalid email address' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.userPassword = hashedPassword;
    await user.save();

    // Password reset successful, show success message or redirect to the login page
    res.render('reset-password', { success: 'Password reset successful. You can now login with your new password.' });
    res.redirect('/login');
  } catch (error) {
    // Handle the error (e.g., show error message or redirect to the reset password form)
    console.error('Error resetting password:', error);
    res.render('reset-password', { error: 'Error resetting password. Please try again later.' });
  }
};
//transaction history for user

exports.gettransaction = async (req, res, next) => {
  const user = req.session.user;
  const userId = req.params.id;
const currentPage = parseInt(req.query.page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  if (!user) {
    return res.redirect('/login');
  }

  try {
        const userData = await User.findByPk(userId);
    const userName = user.userName;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: { userName },
      limit: ITEMS_PER_PAGE,
      offset,

    });
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

    res.render('transaction', { user: userData,userId, transactions,count, currentPage, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while retrieving user transactions');
  }
};