const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const app = express();

// Configure file upload middleware
const upload = require('multer')();
app.use(upload.single('imageData'));


app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', 'views');

app.use(express.static('public'));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
// routes
const adminRoutes = require('./routes/admin');
const routes = require('./routes/routes');

const userController = require('./controllers/usercontroller');
const adminController =require('./controllers/admin');
const errorController = require('./controllers/error.js');

app.use('/', routes);
app.use('/admin', adminRoutes);
app.use(express.json());
app.use(errorController.get404);


//db
const User = require('./models/user');
const Package = require('./models/package');
const Admin =require("./models/admin");
const Demand = require('./models/demand');
const Transaction = require('./models/transaction')

 sequelize.sync().then(() => {
// sequelize.sync({ force: true }).then(() => {
  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
}).catch(error => console.log(error));
