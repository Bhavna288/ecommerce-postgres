const masterAdmin = require('../models/masterAdmin');
const logger = require('../config/logger');
const message = require('../response_message/message');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmailForOtp } = require('../middleware/sendemail')
/**
    * save master admin data.
    *
    * @body {createBy} createBy  to add insert user id.
    * @body {number} createBy if any user change data then updateBy id change .
    
    */
exports.postAddmasterAdmin = async (req, res, next) => {
    try {
        let = {
            firstName,
            lastName,
            phone,
            email,
            status,
            createByIp
        } = await req.body;
        const salt = await bcrypt.genSalt(10);
        let password = bcrypt.hashSync(req.body.password, salt);

        let insert_db_status = await masterAdmin.create({
            firstName,
            lastName,
            phone,
            email,
            password,
            status,
            createByIp
        })
        logger.info(`masterAdmin insert data ${JSON.stringify(insert_db_status)}`);
        res.json({ status: 200, message: message.resmessage.masteradminadded, data: {} });
    } catch (err) {
        console.log(err.message);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

// Master Admin login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
        try {
            const user = await masterAdmin.findOne({
                where: { email }
            });

            if (!user) {
                return res.json({ status: 400, message: message.resmessage.usernotfound, data: {} });
            }
            if (bcrypt.compareSync(password, user.password)) {
                const token = {
                    adminId: user.adminId,
                }
                const tokendata = await jwt.sign({ token }, process.env.SECRETKEY, { expiresIn: '1d' });
                const data = {
                    token: tokendata,
                    adminId: user.adminId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    email: user.email
                }
                return res.json({ status: 200, message: message.resmessage.userlogin, data: data });
            } else {
                return res.json({ status: 400, message: message.resmessage.userwronginfo, data: {} });
            }
        } catch (err) {
            console.log(err);
            return res.json({ status: 500, message: err.message, data: {} });
        }
    }
    return res.json({ status: 501, message: message.resmessage.userwronginfo, data: {} });
};

// Master Admin ChangePassword
exports.changepassword = async (req, res) => {
    const { body } = req;
    try {
        const profile = await masterAdmin.findOne({
            where: { adminId: body.id },
        })
        if (!profile) {
            return res.json({ status: 400, message: message.resmessage.usernotfound, data: {} });
        } else {
            if (bcrypt.compareSync(body.password, profile.password)) {

                if (body.password != body.newpassword) {
                    const salt = await bcrypt.genSalt(10);
                    profile.password = bcrypt.hashSync(req.body.newpassword, salt);
                    profile.save();
                    return res.json({ status: 200, message: message.resmessage.passwordchange, data: {} });
                }
                else {
                    return res.json({ status: 400, message: message.resmessage.oldnewsame, data: {} });
                }
            }
            else {
                return res.json({ status: 400, message: message.resmessage.oldwrong, data: {} });
            }

        }
    } catch (err) {
        return res.json({ status: 500, message: err.message, data: {} });
    }
};


// Master Admin ForgotPassword
exports.forgot = async (req, res) => {
    const { email } = req.body;

    if (email) {
        try {
            const user = await masterAdmin.findOne({
                where: { email }
            });

            if (!user) {
                return res.json({ status: 400, message: message.resmessage.usernotfound, data: {} });
            }
            else {
                user.reset_password_token = Math.floor(1000 + Math.random() * 9000);
                await user.save();
                data = { reset_password_token: user.reset_password_token, email: user.email }

                res.json({ status: 200, message: message.resmessage.passwordsentmail, data: {} });
                await sendEmailForOtp(data);
            }
        } catch (err) {
            console.log(err);
            return res.json({ status: 500, message: message.resmessage.internalservererror, data: {} });
        }
    }

    return res.json({ status: 500, message: message.resmessage.emailvalid, data: {} });
};

// Master Admin ResetPassword
exports.otpverifyandchangepassword = async (req, res) => {
    try {
        const { email } = req.body;
        const userExist = await masterAdmin.findOne({
            where: { email }
        });
        if (userExist) {
            if (req.body.reset_password_token === userExist.reset_password_token) {
                if (bcrypt.compareSync(req.body.newpassword, userExist.password)) {
                    return res.json({ status: 501, message: message.resmessage.oldnewsame, data: {} });
                }
                else {
                    const salt = await bcrypt.genSalt(10);
                    userExist.password = bcrypt.hashSync(req.body.newpassword, salt);
                    await userExist.save();
                    return res.json({ status: 200, message: message.resmessage.passwordchange, data: {} });
                }
            } else {
                return res.json({ status: 500, message: message.resmessage.otpinvalid, data: {} });
            }
        } else {
            return res.json({ status: 500, message: message.resmessage.usernotfound, data: {} });
        }
    } catch (e) {
        res.json({ status: 500, message: e.message });
    }
};

