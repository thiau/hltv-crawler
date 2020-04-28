(function () {
	"use strict";

	const fs = require("fs");

	module.exports = function () {
		return {
			"writeJson": function (data, fileName) {
				return new Promise((resolve, reject) => {
					let dataStringfied = JSON.stringify(data);

					if (!fs.existsSync("./datasets/")) {
						fs.mkdirSync("./datasets/")
					}

					fs.writeFile(`./datasets/${fileName}.json`, dataStringfied, (err) => {
						if (err) {
							reject(err);
						} else {
							resolve("Successfully Written to File.");
						}
					});
				});
			},
			"writeCsv": function (data, fileName) {
				return new Promise((resolve, reject) => {
					if (!fs.existsSync("./datasets/")) {
						fs.mkdirSync("./datasets/")
					}
					
					fs.writeFile(`./datasets/${fileName}.csv`, data, (err) => {
						if (err) {
							reject(err);
						} else {
							resolve("Successfully Written to File.");
						}
					});
				});
			}
		}
	}
}())