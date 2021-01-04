(function () {
	"use strict";

	let fileHelper = require("./helpers/file")();
	const { HLTV } = require('hltv');

	// Crawl data

	console.log("Crawling Data...")
	HLTV.getMatchesStats({ startDate: '2020-01-01', endDate: '2020-12-31' }).then((res) => {
		console.log(`\nTotal matches found: ${res.length}`)
		let date = new Date().getTime();
		let fileName = `matches_${date}`;
		fileHelper.saveJson(res, fileName).then(data => {
			console.log("\nFile saved")
		}).catch(err => {
			console.log(err);
		})
	})
}())