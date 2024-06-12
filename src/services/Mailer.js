const nodemailer = require("nodemailer");
const { EMAIL_FROM, USER_FROM, EMAIL_SERVICE, EMAIL_PASSWORD } = require("../../config/key");

const sendEmail = (email, emailBody, subject, filename) => {

    let mailOptions;
    let transport = nodemailer.createTransport({
        service: EMAIL_SERVICE,
        host: "mail.smtp2go.com",
        port: 2525,
        auth: {
            user: USER_FROM,
            pass: EMAIL_PASSWORD
        }
    });
    mailOptions = {
        to: email,
        from: `InfosecHire<${EMAIL_FROM}>`,
        subject: subject,
        html: emailBody
    };

    return new Promise((resolve, reject) => {
        transport.sendMail(mailOptions).then((result) => {
            console.log('result', result)
            resolve(true);
        }).catch(err => {
            console.log('err', err)
        })
    })
}

module.exports = { sendEmail }
