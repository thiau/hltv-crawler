(function () {
	"use strict";
	const { HLTV } = require('hltv');
	const chalk = require('chalk');

	module.exports = function ({ teamId, hltvPages = 4 }) {
		return {
			"teamId": teamId,
			"hltvPages": hltvPages,
			"getTeamName": function () {
				return new Promise((resolve, reject) => {
					HLTV.getTeam({
						"id": this.teamId
					}).then(data => {
						resolve(data.name);
					}).catch(err => {
						reject(err);
					});
				})
			},
			"getMatchResults": function () {
				return new Promise((resolve, reject) => {
					HLTV.getResults({
						"pages": this.hltvPages,
						"teamID": this.teamId
					}).then(data => {
						resolve(data);
					}).catch(err => {
						reject(err);
					});
				});
			},
			"getMatchDetails": function (match_id) {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						HLTV.getMatch({ "id": match_id }).then(data => {
							console.log("-----------------------");
							console.log(`Match: ${chalk.yellow(match_id)}`);
							console.log(`${chalk.green(data.team1.name)} ${chalk.green('vs')} ${chalk.green(data.team2.name)} - ${chalk.blue(data.event.name)}`);
							resolve(data);
						}).catch(err => {
							console.log(`Error on processing ${match_id}`)
							console.log(err);
							resolve({});
						});
					}, 1000);
				})
			},
			"getMapStats": function () {
				return new Promise((resolve, reject) => {
					HLTV.getTeamStats({ "id": this.teamId }).then(data => {
						resolve(data.mapStats);
					}).catch(err => {
						reject(err);
					})
				});
			},
			"getTeamStats": function () {
				return new Promise((resolve, reject) => {
					HLTV.getTeamStats({ "id": this.teamId }).then((data) => {
						resolve({
							"id": this.teamId,
							"kdRatio": data.overview.kdRatio,
							"matchWinRate": Math.round((data.overview.wins / data.overview.mapsPlayed) * 100) / 100
						});
					}).catch(err => {
						reject(err);
					});
				});
			},
			"getMatchMapsWinRateOld": function (mapStats, matchDetails) {
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
								"id": match.id,
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
			"getHeadToHeadWinRate": function (match) {
				// Default win rate is .5 of winning

				let topHeadToHead = match.headToHead.length > 10 ? match.headToHead.slice(0, 10) : match.headToHead;
				let winners = topHeadToHead.filter(match => match.winner).map(match => match.winner.id);
				let teamWins = winners.filter(winner => winner == teamId);
				let winRate = Math.round((teamWins.length / topHeadToHead.length) * 10) / 10;
				return {
					"id": match.id,
					"headToHeadWinRate": winRate || .5
				}
			},
			"getMatchMapsWinRate": function (mapStats, match) {
				let matchMapWinRates = [];
				let maps = match.maps.map(gameMap => gameMap.name);
				let wins = maps.map(gameMap => mapStats[gameMap] ? mapStats[gameMap].wins : 0).reduce((a, b) => a + b);
				let losses = maps.map(gameMap => mapStats[gameMap] ? mapStats[gameMap].losses : 0).reduce((a, b) => a + b);
				let matchMapWinRate = Math.round((wins / (wins + losses)) * 100) / 100
				return {
					"id": match.id,
					"matchMaps": maps,
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
					"id": match.id,
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
					"id": match.id,
					"isPlayoffs": is_playoffs,
					"isFinal": is_final
				};
			},
			"getMatchWin": function (match) {
				let result = match.result.split(" - ");
				return {
					"id": match.id,
					"victory": parseInt(result[0]) > parseInt(result[1]) ? 1 : 0
				}
			},
			"transformTeamName": function (match) {
				let _match = { ...match }
				let teamName1 = _match.team1.name;
				let teamName2 = _match.team2.name;
				_match.team1 = teamName1;
				_match.team2 = teamName2;

				return _match;
			},
			"getSplittedDate": function (date) {
				return {
					"day": moment(date).date(),
					"month": moment(date).format('MMMM').toLowerCase(),
					"year": moment(date).year()
				}
			},
			"getRankingFromDate": function (match) {
				return new Promise((resolve, reject) => {
					let matchDate = new Date(match.date);
					let lastMondayFromDate = moment(matchDate).startOf('isoWeek').toDate();
					let split = this.getSplittedDate(lastMondayFromDate);

					HLTV.getTeamRanking({ year: split.year, month: split.month, day: split.day }).then((data) => {
						resolve({
							"id": match.id,
							"matchDate": matchDate,
							"currentRank": data.find(rank => rank.team.name == "MIBR").place
						});
					}).catch(err => {
						reject(err);
					});
				});
			}
		}
	}
}())