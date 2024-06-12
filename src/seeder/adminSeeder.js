const adminModel = require("../models/admin.model");
const bcrypt = require('bcryptjs');

module.exports = {
    run: () =>
        new Promise((resolve) => {
            (async() => {
                let adminData = {
                    firstName: "test",
                    lastName: "admin",
                    email: "test@mailinator.com",
                    password: await bcrypt.hashSync("123456"),
                    phone: 1234567890,
                    userType: 1
                }

                await adminModel.create(adminData);
                resolve(true);
            })();
        })
};