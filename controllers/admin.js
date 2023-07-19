const User = require('../models/user');
const Package = require('../models/package');
const Admin = require('../models/admin');
const Demand =require('../models/demand');
const Transaction =require('../models/transaction');
const bcrypt = require('bcrypt');
//register admin and login
exports.getAdminRegistration = (req, res, next) => {
  res.render('admin/registerAdmin');
};

exports.postAdminRegistration = async (req, res, next) => {
  const { userName, userPassword } = req.body;
  try {
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      // An admin already exists, handle error or display appropriate message
      return res.status(400).json({ message: 'Admin already registered' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    const admin = await Admin.create({
      userName,
      userPassword: hashedPassword
    });

    res.redirect('/admin/login');
  } catch (error) {
    // res.render('register', { error });
  }
};
//admin login
exports.getLogin = (req, res, next) => {
    res.render('admin/loginAdmin');
  };
exports.postLogin= (async (req, res) => {
  const { userName, userPassword } = req.body;
  const admin = await Admin.findOne({ where: { userName } });
  if (!admin) {
    return res.status(500).send('Something broke!');
  }
  const isPasswordValid = await bcrypt.compare(userPassword, admin.userPassword);
  if (!isPasswordValid) {
    return res.status(500).send('your password wrong try again!');
  }
  else{
    req.session.admin = admin;
    req.session.id = admin.id; // Store user ID in session
    res.redirect('/admin/dashboard');
      }
});
  //logout
  exports.getLogout=async(req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
}; 

//Dashboard
  exports.getDashboard = async (req, res, next) => {
    try {
      const admin = req.session.admin;
      if (req.session.admin) {
        const users = await User.findAll();
        const packages = await Package.findAll();     
        const demands =await Demand.findAll();   
        const transations =await Transaction.findAll();
        res.render('admin/dashboard', {
          pageTitle: 'Dashboard',
          path: '/admin/dashboard',
          users,
          packages,
          demands,
          transations,
        });
      } else {
        res.redirect('/admin/login');
      }
    } catch (error) {
      console.error(error);
    }
  };
  //delete user
  exports.deleteUser = (req, res, next) => {
    const id = req.params.id;
    console.log("User ID: ", id);
    if (!req.session.admin) {
      return res.redirect('/admin/login');
    }
  
    User.destroy({
      where: {
        id: id,
      }
    })
    .then(() => {
      // Check if the deleted user is the currently logged-in user
      if (req.session.user && req.session.user.id === id) {
        // Log out the user by destroying the session
        req.session.destroy((err) => {
          if (err) {
            console.log(err);
          }
          // Redirect to the login page or any other appropriate page
          res.redirect('/login');
        });
      } else {
        // Redirect to the admin dashboard or any other appropriate page
        res.redirect('/admin/dashboard');
      }
    })
    .catch(err => console.log(err));
  };
  
// create packages:

exports.createPackage = (req, res, next) => {
  const { name, description, price, image } = req.body;
  if (!req.session.admin) {
    // Admin not authenticated, handle error or redirect to login page
    return res.redirect('/admin/login');
  }

  Package.create({
    name: name,
    description: description,
    price: price,
    image: image
  })
    .then(result => {
      res.redirect('/admin/dashboard');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getPAckages = (req, res, next) => {
  res.render('admin/createPackage', {});
};
//delete packages 
exports.deletePackage = (req, res, next) => {
  const id = req.params.id;
  console.log("package id", id);
  if (!req.session.admin) {
    // Admin not authenticated, handle error or redirect to login page
    return res.redirect('/admin/login');
  }
  Package.destroy({
    where: {
      id: id,
    }
  })
  .then(() => {
    res.redirect('/admin/dashboard');
  })
  .catch(err => console.log(err));
};
//showpic
exports.showPic = async (req, res, next) => {
  const id = req.params.id;

  try {
    const admin = req.session.admin;
    if (req.session.admin) {
      const demands = await Demand.findAll();
      // Retrieve the demand by ID
      const demand = await Demand.findByPk(id);

      if (demand) {
        const imageUrl = demand.imageData ? `data:image/jpeg;base64,${demand.imageData}` : null;

        res.render('admin/showPic', {
          demands,
          demand,
          selectedDemand: demand, // Pass the selectedDemand object to the template
          imageUrl, // Pass the imageUrl to the template
        });
      } else {
        // Handle the case when demand is not found
        res.redirect('/admin/dashboard');
      }
    } else {
      res.redirect('/admin/login');
    }
  } catch (error) {
    console.error(error);
  }
};


//accept and delete the demand :
//delete demand 
exports.deleteDemand = async (req, res, next) => {
  const demandId = req.params.id;

  try {
    if (!req.session.admin) {
      // Admin not authenticated, handle error or redirect to login page
      return res.redirect('/admin/login');
    }

    // Retrieve the demand by ID
    const demand = await Demand.findByPk(demandId);

    // Check if the demand exists
    if (!demand) {
      return res.status(404).send('Demand not found');
    }

    // Update the user's wallet balance
    const userName = demand.userName;
    const user = await User.findOne({ where: { userName } });
  
    // Check if the user exists
    if (!user) {
      return res.status(404).send('User not found');
    }

    const updatedBalance = user.wallet - demand.money;
    user.wallet = updatedBalance;
    await user.save();
    // Update the wallet balance in the user's session
    req.session.user.wallet = updatedBalance;
    // Delete the demand from the database
    await Demand.destroy({
      where: {
        id: demandId,
      },
    });

    // Redirect to the dashboard or handle the response as needed
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred while deleting the demand');
  }
};
//accept demand :
exports.acceptDemand = async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve the demand by ID
    const demand = await Demand.findByPk(id);

    // Check if the demand exists
    if (!demand) {
      return res.status(404).send('Demand not found');
    }

    // Update the wallet balance
    const userName = demand.userName;
    const user = await User.findOne({ where: { userName } });

    // Check if the user exists
    if (!user) {
      return res.status(404).send('User not found');
    }

    const updatedBalance = user.wallet + demand.money;
    user.wallet = updatedBalance;
    await user.save();
    console.log(user.wallet);
    // Update the wallet balance in the user's session
  req.session.user.wallet = updatedBalance;

    // Send response
    res.send('Wallet balance updated successfully');
    // res.redirect('/admin/dashboard');
    // res.console.log("it work");
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred while updating the wallet balance');
  }
};