(function () {
	"use strict";

	const fs = require("fs");

	module.exports = function () {
		return {
			"writeJsonToCsv": function (data, fileName) {
				let dataStringfied = JSON.stringify(data);

				fs.writeFile(`./datasets/${fileName}.json`, dataStringfied, (err) => {
					if (err) {
						console.log(err);
					} else {
						console.log("Successfully Written to File.");
					}
				});
			}
		}
	}
}())