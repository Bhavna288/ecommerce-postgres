const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const message = require('../response_message/message');

exports.login = async (req, res) => {
    const { phone, password } = req.body;

    if (phone && password) {
        try {
            const user = await User
                .findOne({
                    where: {
                        mobileNumber: phone,
                        status: 1
                    },
                    include: [{ all: true, nested: true }],
                });
            if (!user) {
                return res.json({ status: 501, message: message.resmessage.usernotfound, data: {} });
            } else {
                if (user.status == "1") {
                    if (bcrypt.compareSync(password, user.password)) {
                        const token = {
                            userId: user.userid
                        }
                        const tokendata = jwt.sign({ token }, process.env.SECRETKEY, { expiresIn: '1d' });
                        const data = {
                            token: tokendata,
                            userId: user.userId,
                            name: user.name,
                            mobileNumber: user.mobileNumber,
                            email: user.email,
                            admin: user.admin,
                        }
                        return res.json({ status: 200, message: message.resmessage.userlogin, data: data });
                    } else {
                        return res.json({ status: 400, message: message.resmessage.userwronginfo, data: {} });
                    }
                } else {
                    return res.json({ status: 400, message: message.resmessage.usernotfound, data: {} });
                }
            }
        } catch (err) {
            console.log(err);
            return res.json({ status: 500, message: err.message, data: {} });
        }
    }
    return res.json({ status: 501, message: message.resmessage.userwronginfo, data: {} });
}