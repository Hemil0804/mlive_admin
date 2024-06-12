const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const initVector = crypto.randomBytes(16)
const Securitykey = "2d6a4bddca982f33060bbf5aa1fc9c78";
//console.log('Securitykey',Securitykey.toString('hex'))
//const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

//let message = {
//    "email": "tsswwdw@mailinator.com",
//    "password": "123456"
//}
//let encryptedData = cipher.update(JSON.stringify(message), "utf-8", "hex");

//encryptedData += cipher.final("hex");

//console.log("Encrypted message: " + encryptedData);




//const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);

//let decryptedData = decipher.update(encryptedData, "hex", "utf-8");

//decryptedData += decipher.final("utf8");

//console.log("Decrypted message: " + decryptedData);
exports.requestDecrypted = async(req, res, next) => {
	console.log('req---',req.body.request)

	const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);

	let decryptedData = decipher.update(req.body.request, "hex", "utf-8");
	console.log("Decrypted message: " + decryptedData);
	decryptedData += decipher.final("utf8");

	console.log("Decrypted message: " + decryptedData);
    req.body = decryptedData;
    next();

};