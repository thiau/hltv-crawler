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
			// matchResults = matchResults.slice(0, 3);

			// Transform Team Name to only keep names
			console.log(chalk.yellow("STEP: ") + chalk.blue("Transforming Team Name\n"));
			matchResults = matchResults.map(match => hltvCrawler.transformTeamName(match));

			// Get initial match details
			console.log(chalk.yellow("STEP: ") + chalk.blue("Getting Match Details\n"));
			let matchDetails = [];
			let picks = [];
			for (let i in matchResults) {
				let matchDetail = await hltvCrawler.getMatchDetails(matchResults[i].id);
				matchDetails.push(matchDetail);

				// decode vetoes
				await (function () {
					let all_picked = matchDetail.vetoes.filter(pick => pick.type == "picked");
					picks = all_picked.map(veto => {
						return {
							"map": veto.map,
							"picker": veto.team.name
						}
					})
				}())
			}


			// // Save matchDetails in temp file
			// console.log(chalk.yellow("STEP: ") + chalk.blue("Saving temp matchDetails JSON\n"));
			// await fileHelper.writeJson(matchDetails, `matchDetails_${teamName}_${date}`);

			// // Save mapStats in temp file
			// console.log(chalk.yellow("STEP: ") + chalk.blue("Saving temp mapStats JSON\n"));
			// await fileHelper.writeJson(mapStats, `mapStats_${teamName}_${date}`);

			// New
			// Split bo3 into bo1s

			console.log(chalk.yellow("\nSTEP: ") + chalk.blue("Waiting 8 Seconds Before proceed\n"));
			await (() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve();
					}, 10000)
				})
			})();

			function getSelectedAndOpositeTeam(match, teamName) {
				let teams = {}
				if (match.team1.name == teamName) {
					teams.selected = match.team1
					teams.oposite = match.team2
				} else {
					teams.selected = match.team2
					teams.oposite = match.team1
				}

				return teams
			}

			// Split BO3 in BO1 and get results
			console.log(chalk.yellow("STEP: ") + chalk.blue("Splitting BO3 in BO1 and get map result details\n"));
			let bo1MatchResults = [];
			for (let j in matchDetails) {
				for (let i in matchDetails[j].maps) {
					console.log(chalk.yellow("\nMatch ID: ") + chalk.blue(matchDetails[j].id));
					console.log(chalk.yellow("Match Stats ID: ") + chalk.blue(matchDetails[j].maps[i].statsId || "Not Played"));

					if (matchDetails[j].maps[i].statsId) {
						let matchMapDetail = await hltvCrawler.getMatchMapStats(matchDetails[j].maps[i].statsId);
						console.log(chalk.yellow("Match Map: ") + chalk.blue(matchMapDetail.map));

						let teams = getSelectedAndOpositeTeam(matchMapDetail, teamName);
						let picked_map = picks.find(pick => pick.map == matchMapDetail.map)

						bo1MatchResults.push({
							"id": matchDetails[j].id,
							"oposite_team": teams.oposite.name,
							"victory": teams.selected.score > teams.oposite.score ? 1 : 0,
							"map": matchMapDetail.map,
							"pick": picked_map ? (picked_map.picker == teams.selected.name ? 1 : 0) : 2,
							"mapWinRate": mapStats[matchMapDetail.map].winRate
						});
					}
				}
			};

			// @TODO: Apply to matchDetails_bo3 and matchDetails_bo1
			// // Remove all matches with errors
			// matchDetails = matchDetails.filter((item) => Object.keys(item).length);

			// console.log(chalk.green("\nINFO: ") + chalk.blue(`${matchDetails.length} matches after cleanup\n`));

			// Regular methods
			// console.log(chalk.yellow("\nSTEP: ") + chalk.blue("Getting all features"));
			// let matchResultsDF = new DataFrame(matchResults);


			// @TODO: Improve MatchMaap Win Rate just for Bo1s

			let matchResultsDF = new DataFrame(bo1MatchResults);
			// let matchMapsWinRate = new DataFrame(matchDetails.map(match => hltvCrawler.getMatchMapsWinRate(mapStats, match)));
			// let matchHeadToHeadWinRate = new DataFrame(matchDetails.map(match => hltvCrawler.getHeadToHeadWinRate(match)));
			//map pick

			// // let matchPlayoffsType = new DataFrame(matchDetails.map(match => hltvCrawler.getPlayoffType(match)));
			// let matchWin = new DataFrame(matchResults.map(match => hltvCrawler.getMatchWin(match)));
			// let matchEventTypes = new DataFrame(matchResults.map(match => hltvCrawler.getEventType(match)));

			// Join DataFrames
			// console.log(chalk.yellow("STEP: ") + chalk.blue("Joining dataframes of features"));
			// let matchInfo = matchResultsDF.merge(
			// 	matchMapsWinRate, ["id"], "inner").merge(
			// 		matchHeadToHeadWinRate, ["id"], "inner");

			// // Join DataFrames
			// console.log(chalk.yellow("STEP: ") + chalk.blue("Joining dataframes of features"));
			// let matchInfo = matchResultsDF.merge(
			// 	matchMapsWinRate, ["id"], "inner").merge(
			// 		matchPlayoffsType, ["id"], "inner").merge(
			// 			matchWin, ["id"], "inner").merge(
			// 				matchEventTypes, ["id"], "inner").merge(
			// 					matchHeadToHeadWinRate, ["id"], "inner");

			// // Columns to keep in the final dataset
			// let columns = ["id", "team2", "format", "isPlayoffs", "isFinal", "eventName", "matchMapWinRate", "eventType", "headToHeadWinRate", "victory"];
			let columns = ["id", "oposite_team", "map", "pick", "mapWinRate", "victory"];

			// Generate final JSON Object
			console.log(chalk.yellow("STEP: ") + chalk.blue("Generating final JSON"));
			let matchesObject = matchResultsDF.get(columns).to_json({ "orient": "records" });

			// // Generate final CSV
			// console.log(chalk.yellow("STEP: ") + chalk.blue("Generating final CSV"));
			// let csvFile = matchInfo.get(columns).to_csv();

			// Save final JSON Object to file
			console.log(chalk.yellow("STEP: ") + chalk.blue("Saving to JSON"));
			await fileHelper.writeJson(matchesObject, `matches_${teamName}_${date}`);

			// // Save final CSV Object to file
			// console.log(chalk.yellow("STEP: ") + chalk.blue("Saving to CSV"));
			// await fileHelper.writeCsv(csvFile, `matches_${teamName}_${date}`);

			// // Summary
			// console.log(chalk.blue("\n::::::::::::::: Summary ::::::::::::::\n"));
			// console.log(`${chalk.yellow("Matches Analyzed:")} ${chalk.blue(matchInfo.length)}`);
			// console.log(`${chalk.yellow("Matches with erros:")} ${chalk.blue(matchResults.length - matchInfo.length)}`);
			// console.log(chalk.blue("\n::::::::::::::::::::::::::::::::::::::\n"));
		} catch (e) {
			console.log(e);
		}
	})();
}())