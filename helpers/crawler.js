(function () {
	"use strict";
	const { HLTV } = require('hltv');

	module.exports = function ({ teamId, hltvPages = 4 }) {
		return {
			"teamId": teamId,
			"hltvPages": hltvPages,
			"getMatchResults": function () {
				console.log("Getting Match Results")
				return new Promise((resolve, reject) => {
					HLTV.getResults({
						"pages": this.hltvPages,
						"teamID": this.teamId
					}).then(data => {
						resolve(data);
					}).catch(err => {
						reject(err);
					});
				})
			},
			"getMatchDetails": function (match_id) {
				return new Promise((resolve, reject) => {
					HLTV.getMatch({ "id": match_id }).then(data => {
						console.log("-----------------------");
						console.log(`Gettting Info for Match ${match_id}`);
						console.log(`${data.team1.name} vs ${data.team2.name} - ${data.event.name}`);
						resolve(data);
					}).catch(err => {
						console.log(`Error on processing ${match_id}`)
						console.log(err);
						resolve({});
					});
				})
			},
			"getMapStats": function () {
				console.log("Getting Match Stats")
				return new Promise((resolve, reject) => {
					HLTV.getTeamStats({ "id": this.teamId }).then(data => {
						resolve(data.mapStats);
					}).catch(err => {
						reject(err);
					})
				});
			},
			"getMatchMapsWinRate": function (mapStats, matchDetails) {
				console.log("Getting Overal Map Win Rate");
				return new Promise((resolve, reject) => {
					try {
						let matchMapWinRates = [];
						matchDetails.forEach(match => {
							let maps = match.maps.map(gameMap => gameMap.name);
							let wins = maps.map(gameMap => mapStats[gameMap].wins).reduce((a, b) => a + b);
							let losses = maps.map(gameMap => mapStats[gameMap].losses).reduce((a, b) => a + b);
							let matchMapWinRate = Math.round((wins / (wins + losses)) * 100) / 100
							matchMapWinRates.push({
								"matchId": match.id,
								"maps": maps,
								"matchMapWinRate": matchMapWinRate
							});
						});
						resolve(matchMapWinRates);
					} catch (e) {
						reject(e)
					}
				});
			},
			"getMatchMapsWinRate2": function (mapStats, match) {
				let matchMapWinRates = [];
				let maps = match.maps.map(gameMap => gameMap.name);
				let wins = maps.map(gameMap => mapStats[gameMap].wins).reduce((a, b) => a + b);
				let losses = maps.map(gameMap => mapStats[gameMap].losses).reduce((a, b) => a + b);
				let matchMapWinRate = Math.round((wins / (wins + losses)) * 100) / 100
				return {
					"matchId": match.id,
					"maps": maps,
					"matchMapWinRate": matchMapWinRate
				};
			},
			"getEventType": function (match) {
				let eventType = "";
				let matchName = match.event.name.toLowerCase();
				if (matchName.includes("qualifier")) {
					eventType = "online";
				} else if (matchName.includes("week")) {
					eventType = "online";
				} else if (matchName.includes("major")) {
					eventType = "major";
				} else {
					eventType = "lan";
				}

				return {
					"matchId": match.id,
					"eventName": match.event.name,
					"eventType": eventType
				}
			},
			"getPlayoffType": function (match) {
				let playoffTypes = ["Quarter-final", "Semi-final", "Grand final"];

				let is_playoffs = 0;
				let is_final = 0;
				if (match.additionalInfo) {
					if (match.additionalInfo.includes(playoffTypes[0])
						|| match.additionalInfo.includes(playoffTypes[1])
						|| match.additionalInfo.includes(playoffTypes[2])) {
						is_playoffs = 1;
						is_final = match.additionalInfo.includes(playoffTypes[2]) ? 1 : 0;
					} else {
						is_playoffs = 0
					}
				} else {
					is_playoffs = 0
				}

				return {
					"matchId": match.id,
					"isPlayoffs": is_playoffs,
					"isFinal": is_final
				};
			},
			"getMatchWin": function (match) {
				let result = match.result.split(" - ");
				return {
					"matchId": match.id,
					"victory": parseInt(result[0]) > parseInt(result[1]) ? 1 : 0
				}
			}
		}
	}
}())