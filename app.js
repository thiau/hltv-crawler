(function () {
	"use strict";

	let HltvCrawler = require("./helpers/crawler");

	let hltvCrawler = HltvCrawler({
		"teamId": 5973,
		"hltvPages": 1
	});

	(async () => {
		try {
			// Async methods
			let [matchResults, mapStats] = await Promise.all([hltvCrawler.getMatchResults(), hltvCrawler.getMapStats()]);
			matchResults = matchResults.slice(0, 5); // temp
			let matchDetails = await Promise.all(matchResults.map(match => hltvCrawler.getMatchDetails(match.id)));

			// Regular methods
			let matchMapsWinRate = matchDetails.map(match => hltvCrawler.getMatchMapsWinRate2(mapStats, match));
			let matchPlayoffsType = matchDetails.map(match => hltvCrawler.getPlayoffType(match));
			let getMatchWin = matchResults.map(match => hltvCrawler.getMatchWin(match));
			let matchEventTypes = matchResults.map(match => hltvCrawler.getEventType(match));
		} catch (e) {
			console.log(e);
		}
	})();
}())