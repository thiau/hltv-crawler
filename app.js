(function () {
	"use strict";

	// Import Helpers
	let hltvCrawler = require("./helpers/crawler")();
	let fileHelper = require("./helpers/file")();
	const chalk = require('chalk');

	// Define auxiliar variables
	const log = console.log;
	const green = chalk.green;
	const red = chalk.red;
	const cyan = chalk.cyan;

	// Define time variables
	let startDate = '2020-12-15';
	let endDate = '2020-12-31';

	log(green("\n:: Starting HLTV Crawler ::"))
	log(cyan("\nCrawling Data..."));

	// Crawl HTLV Matches
	hltvCrawler.getMatchData(startDate, endDate).then(matchData => {
		log(`${cyan("Total Matches Found:")} ${green(matchData.count)}`);
		log(cyan("Saving the file..."));

		// Save the file for future use
        let fileName = `matches_${new Date().getTime()}`;
		fileHelper.saveJson(matchData, fileName).then(data => {
			log(green("\nFinished!\n"));
		}).catch(err => {
			log(red("Error on saving the file!"));
			log(err);
		})
	}).catch(err => {
		log(err);
	})

}())