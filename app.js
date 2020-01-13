(function () {
	"use strict";
	let HltvCrawler = require("./helpers/crawler");
	let DataFrame = require('pandas-js').DataFrame;
	let csvHelper = require("./helpers/csv")();

	let hltvCrawler = HltvCrawler({
		"teamId": 9215,
		"hltvPages": 2
	});

	(async () => {
		try {
			// Get current date
			// let date = new Date().toLocaleString().split(" ")[0].split("-").join("_");
			let date = new Date().toLocaleString().split(",")[0].split("/").join("_");

			// Async methods
			let [matchResults, mapStats] = await Promise.all([hltvCrawler.getMatchResults(), hltvCrawler.getMapStats()]);

			// Temp strategy to reduce result size
			// matchResults = matchResults.slice(0, 20);

			// Transform Team Name to only keep names
			console.log("Transforming Team Name")
			matchResults = matchResults.map(match => hltvCrawler.transformTeamName(match));

			// Get initial match details
			let matchDetails = await Promise.all(matchResults.map(match => hltvCrawler.getMatchDetails(match.id)));

			// Remove all matches with errors
			matchDetails = matchDetails.filter((item) => Object.keys(item).length);

			// Regular methods
			console.log("Getting all features");
			let matchResultsDF = new DataFrame(matchResults);
			let matchMapsWinRate = new DataFrame(matchDetails.map(match => hltvCrawler.getMatchMapsWinRate(mapStats, match)));
			let matchHeadToHeadWinRate = new DataFrame(matchDetails.map(match => hltvCrawler.getHeadToHeadWinRate(match)));
			let matchPlayoffsType = new DataFrame(matchDetails.map(match => hltvCrawler.getPlayoffType(match)));
			let matchWin = new DataFrame(matchResults.map(match => hltvCrawler.getMatchWin(match)));
			let matchEventTypes = new DataFrame(matchResults.map(match => hltvCrawler.getEventType(match)));

			// Join DataFrames
			console.log("Joining dataframes of features");
			let matchInfo = matchResultsDF.merge(
				matchMapsWinRate, ["id"], "inner").merge(
					matchPlayoffsType, ["id"], "inner").merge(
						matchWin, ["id"], "inner").merge(
							matchEventTypes, ["id"], "inner").merge(
								matchHeadToHeadWinRate, ["id"], "inner");

			// Columns to keep in the final dataset
			let columns = ["id", "team2", "format", "isPlayoffs", "isFinal", "eventName", "matchMapWinRate", "eventType", "headToHeadWinRate", "victory"]

			// Generate final JSON Object
			console.log("Generating final JSON");
			let matchesObject = matchInfo.get(columns).to_json({ "orient": "records" })

			// Get total matches
			console.log(`Total of ${matchInfo.length} matches analyzed`);
			console.log(`Total of ${matchResults.length - matchInfo.length} matches with errors`)

			// Save final JSON Object to CSV
			console.log("Saving to JSON");
			csvHelper.writeJsonToCsv(matchesObject, `matches_${matchResults[0].team1}_${date}`);
		} catch (e) {
			console.log(e);
		}
	})();
}())