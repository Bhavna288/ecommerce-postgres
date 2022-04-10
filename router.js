'use strict';
const API = require('./middleware/apikey');
const { verifyToken } = require('./middleware/verifyToken');
const authRoutes = require('./routes/auth.router');
const masterAdminRoutes = require('./routes/masteradmin.router');
const userRoutes = require('./routes/user.router');
const countryMasterRoutes = require('./routes/countrymaster.router');
const stateMasterRoutes = require('./routes/statemaster.router');
const cityMasterRoutes = require('./routes/citymaster.router');
const userAddressRoutes = require('./routes/useraddress.router');
const productCategoryRoutes = require('./routes/productcategory.router');
const productDiscountRoutes = require('./routes/productdiscount.router');
const productRoutes = require('./routes/product.router');
const userCartRoutes = require('./routes/usercart.router');
const userWishlistRoutes = require('./routes/userwishlist.router');
const orderRoutes = require('./routes/order.router');
const paymentRoutes = require('./routes/payment.router');
const availablePincodeRoutes = require('./routes/availablepincode.router');
const bannerRoutes = require('./routes/banner.router');

module.exports = (app) => {
    app.use('/auth', API.validateKey, authRoutes);
    app.use('/masteradmin', API.validateKey, masterAdminRoutes);
    app.use('/user', API.validateKey, userRoutes);
    app.use('/countrymaster', API.validateKey, countryMasterRoutes);
    app.use('/statemaster', API.validateKey, stateMasterRoutes);
    app.use('/citymaster', API.validateKey, cityMasterRoutes);
    app.use('/useraddress', verifyToken, API.validateKey, userAddressRoutes);
    app.use('/productcategory', API.validateKey, productCategoryRoutes);
    app.use('/productdiscount', API.validateKey, productDiscountRoutes);
    app.use('/product', API.validateKey, productRoutes);
    app.use('/usercart', verifyToken, API.validateKey, userCartRoutes);
    app.use('/userwishlist', verifyToken, API.validateKey, userWishlistRoutes);
    app.use('/order', verifyToken, API.validateKey, orderRoutes);
    app.use('/payment', verifyToken, API.validateKey, paymentRoutes);
    app.use('/pincode', verifyToken, API.validateKey, availablePincodeRoutes);
    app.use('/banner', API.validateKey, bannerRoutes);
};