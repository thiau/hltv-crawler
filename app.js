(function () {
	"use strict";

	let HltvCrawler = require("./helpers/crawler");
	let DataFrame = require('pandas-js').DataFrame;
	let fileHelper = require("./helpers/csv")();
	const chalk = require('chalk');

	const args = process.argv;

	// @TODO: Improve: Find parameters by name, not position
	let teamID = args[2].split("=")[1];
	let pages = args[3].split("=")[1] || 1;

	let hltvCrawler = HltvCrawler({
		"teamId": teamID,
		"hltvPages": pages
	});

	(async () => {
		let teamName = await hltvCrawler.getTeamName();

		console.log(chalk.blue("\n:::::::: Starting HLTV Crawler ::::::::\n"));
		console.log(`Team: ${chalk.green(teamName)}`);
		console.log(`Pages to crawl: ${chalk.green(pages)}\n`);
		console.log(chalk.blue("::::::::::::::::::::::::::::::::::::::::\n"));


		try {
			// Get current date
			// let date = new Date().toLocaleString().split(" ")[0].split("-").join("_");
			let date = new Date().toLocaleString().split(",")[0].split("/").join("_");

			// Async methods
			console.log(chalk.yellow("STEP: ") + chalk.blue("Getting Match Results and Map Stats\n"));
			let [matchResults, mapStats] = await Promise.all([hltvCrawler.getMatchResults(), hltvCrawler.getMapStats()]);

			console.log(chalk.green("INFO: ") + chalk.blue(`${matchResults.length} matches found\n`));

			// Temp strategy to reduce result size
			// matchResults = matchResults.slice(0, 15);

			// Transform Team Name to only keep names
			console.log(chalk.yellow("STEP: ") + chalk.blue("Transforming Team Name\n"));
			matchResults = matchResults.map(match => hltvCrawler.transformTeamName(match));

			// Get initial match details
			console.log(chalk.yellow("STEP: ") + chalk.blue("Getting Match Details\n"));
			let matchDetails = [];
			for (let i in matchResults) {
				let matchDetail = await hltvCrawler.getMatchDetails(matchResults[i].id);
				matchDetails.push(matchDetail);
			}

			// Remove all matches with errors
			matchDetails = matchDetails.filter((item) => Object.keys(item).length);

			console.log(chalk.green("\nINFO: ") + chalk.blue(`${matchDetails.length} matches after cleanup\n`));

			// Save matchDetails in temp file
			console.log(chalk.yellow("STEP: ") + chalk.blue("Saving temp matchDetails JSON\n"));
			await fileHelper.writeJson(matchDetails, `matchDetails_${teamName}_${date}`);

			// Save mapStats in temp file
			console.log(chalk.yellow("STEP: ") + chalk.blue("Saving temp mapStats JSON\n"));
			await fileHelper.writeJson(mapStats, `mapStats_${teamName}_${date}`);

			// Regular methods
			console.log(chalk.yellow("\nSTEP: ") + chalk.blue("Getting all features"));
			let matchResultsDF = new DataFrame(matchResults);
			let matchMapsWinRate = new DataFrame(matchDetails.map(match => hltvCrawler.getMatchMapsWinRate(mapStats, match)));
			let matchHeadToHeadWinRate = new DataFrame(matchDetails.map(match => hltvCrawler.getHeadToHeadWinRate(match)));
			let matchPlayoffsType = new DataFrame(matchDetails.map(match => hltvCrawler.getPlayoffType(match)));
			let matchWin = new DataFrame(matchResults.map(match => hltvCrawler.getMatchWin(match)));
			let matchEventTypes = new DataFrame(matchResults.map(match => hltvCrawler.getEventType(match)));


			// // Only get Bo1
			// let teste = matchResults.filter(match => match.format == 'bo1')

			// // Only get not bo1
			// let teste2 = matchResults.filter(match => match.format !== 'bo1')
			// console.log(teste2[1])


			// Join DataFrames
			console.log(chalk.yellow("STEP: ") + chalk.blue("Joining dataframes of features"));
			let matchInfo = matchResultsDF.merge(
				matchMapsWinRate, ["id"], "inner").merge(
					matchPlayoffsType, ["id"], "inner").merge(
						matchWin, ["id"], "inner").merge(
							matchEventTypes, ["id"], "inner").merge(
								matchHeadToHeadWinRate, ["id"], "inner");

			// Columns to keep in the final dataset
			let columns = ["id", "team2", "format", "isPlayoffs", "isFinal", "eventName", "matchMapWinRate", "eventType", "headToHeadWinRate", "victory"];

			// Generate final JSON Object
			console.log(chalk.yellow("STEP: ") + chalk.blue("Generating final JSON"));
			let matchesObject = matchInfo.get(columns).to_json({ "orient": "records" });

			// Generate final CSV
			console.log(chalk.yellow("STEP: ") + chalk.blue("Generating final CSV"));
			let csvFile = matchInfo.get(columns).to_csv();

			// Save final JSON Object to file
			console.log(chalk.yellow("STEP: ") + chalk.blue("Saving to JSON"));
			await fileHelper.writeJson(matchesObject, `matches_${teamName}_${date}`);

			// Save final CSV Object to file
			console.log(chalk.yellow("STEP: ") + chalk.blue("Saving to CSV"));
			await fileHelper.writeCsv(csvFile, `matches_${teamName}_${date}`);

			// Summary
			console.log(chalk.blue("\n::::::::::::::: Summary ::::::::::::::\n"));
			console.log(`${chalk.yellow("Matches Analyzed:")} ${chalk.blue(matchInfo.length)}`);
			console.log(`${chalk.yellow("Matches with erros:")} ${chalk.blue(matchResults.length - matchInfo.length)}`);
			console.log(chalk.blue("\n::::::::::::::::::::::::::::::::::::::\n"));
		} catch (e) {
			console.log(e);
		}
	})();
}())