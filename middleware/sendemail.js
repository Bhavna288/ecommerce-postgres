const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const Handlebars = require('handlebars');
const Order = require("../models/order");
const Product = require("../models/product");
const OrderItems = require("../models/orderItems");

let gmailTransporterForGsuit = nodemailer.createTransport({
    host: process.env.HOSTMAIL, // Gmail Host
    port: 465, // Port
    secure: true, // this is true as port is 465
    auth: {
        user: process.env.USEREMAIL,// generated ethereal user
        pass: process.env.PASS, // generated ethereal password
    }
});

const getTemplate = (type) => {
    const file = path.join(__dirname, `../html/${type}.hbs`);
    return file;
}

const readFile = (name) => {
    return new Promise((resolve, reject) => {
        fs.readFile(name, 'utf-8', (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

const sendEmailForOtp = async (data) => {

    return new Promise(async (resolve, reject) => {
        try {
            const filePath = getTemplate('otp');

            const file = await readFile(filePath);
            console.log(filePath);
            const template = Handlebars.compile(file);

            var replacements = {
                reset_password_token: data.reset_password_token
            };
            const html = template(replacements);
            console.log(replacements)

            const mailOptions = {
                from: process.env.USEREMAIL, // sender email address
                // to: "", // list of receivers
                to: data.email,
                subject: "Verify OTP", // Subject of Email
                text: "", // plain text body
                html: html, // html body
                replyTo: "", // If reply is required then add that emial address
                // attachments: attachments
            };

            gmailTransporterForGsuit.sendMail(mailOptions, function (err, body) {
                //If there is an error, render the error page
                if (err) {
                    console.log(">>>>>>>>>error>>>>>>>>", err);
                    return reject({ status: 0, message: err });
                }
                //Else we can greet\ and leave
                else {
                    console.log(">>>>>>>>>body>>>>>>>>", body);
                    return resolve(body);
                }
            });
        } catch (e) {
            return resolve({ status: 0, message: e });
        }
    });
}

Handlebars.registerHelper('get_row_span', function (obj) {
    return obj.length * 3 + 1;
});

const sendEmailForOrder = async (data) => {

    return new Promise(async (resolve, reject) => {
        try {

            const filePath = getTemplate('order');

            const file = await readFile(filePath);
            console.log(filePath);
            const template = Handlebars.compile(file);
            var replacements = {
                referenceNumber: data.referenceNumber,
                orderDate: data.orderDate,
                totalPrice: data.totalPrice,
                deliveryStatus: data.orderDate,
                deliveryType: data.deliveryType,
                remarks: data.remarks,
                address: data.address,
                payment: data.payment,
                orderItems: data.orderItems
            };
            const html = template(replacements);
            // console.log(replacements)

            const mailOptions = {
                from: process.env.USEREMAIL, // sender email address
                // to: "", // list of receivers
                to: data.user.email,
                subject: "Order Confirmation", // Subject of Email
                text: "", // plain text body
                html: html, // html body
                replyTo: "", // If reply is required then add that emial address
                // attachments: attachments
            };

            gmailTransporterForGsuit.sendMail(mailOptions, function (err, body) {
                //If there is an error, render the error page
                if (err) {
                    console.log(">>>>>>>>>error>>>>>>>>", err);
                    return reject({ status: 0, message: err });
                }
                //Else we can greet\ and leave
                else {
                    console.log(">>>>>>>>>body>>>>>>>>", body);
                    return resolve(body);
                }
            });
        } catch (e) {
            return resolve({ status: 0, message: e });
        }
    });

}

module.exports = { sendEmailForOtp, sendEmailForOrder };
