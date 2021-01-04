(function () {
	"use strict";

	// Import Helpers
	let hltvCrawler = require("./helpers/crawler")();
	let fileHelper = require("./helpers/file")()

	console.log("Crawling Data...")

	// Crawl HTLV Matches
	hltvCrawler.getMatchData('2020-12-15', '2020-12-31').then(matchData => {
		console.log(`Total Matches Found: ${matchData.count}`)
		console.log("Saving the file...")

		// Save the file for future use
        let fileName = `matches_${new Date().getTime()}`;
		fileHelper.saveJson(matchData, fileName).then(data => {
			console.log("All Done!")
		}).catch(err => {
			console.log("Error on saving the file!")
			console.log(err)
		})
	}).catch(err => {
		console.log(err);
	})

}())