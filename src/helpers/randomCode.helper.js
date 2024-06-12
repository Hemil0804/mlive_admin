const { ACTIVE_STATUS } = require("../../config/key");
const UserModel = require("../models/user.model");

async function generateCode(length) {
	var numberChars = "0123456789";
	var upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var lowerChars = "abcdefghijklmnopqrstuvwxyz";
	var specialChars = "#@*_%!";
	var allChars = numberChars + upperChars + lowerChars + specialChars;
	var randPasswordArray = Array(length);
	randPasswordArray[0] = numberChars;
	randPasswordArray[1] = upperChars;
	randPasswordArray[2] = lowerChars;
	randPasswordArray[3] = specialChars;
	randPasswordArray = randPasswordArray.fill(allChars, 4);
	return shuffleArray(
		randPasswordArray.map(function (x) {
			return x[Math.floor(Math.random() * x.length)];
		}),
	).join("");
}

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

async function getUniqueCode(length) {
	const generatedCode = await generateCode(length);

	const foundUser = await UserModel.findOne({ status: ACTIVE_STATUS, invitationCode: generatedCode });
	if (foundUser) {
		return await getUniqueCode(length);
	} else {
		return generatedCode;
	}
}

module.exports = { getUniqueCode };