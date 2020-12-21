(function () {
	"use strict";

	const { HLTV } = require('hltv');

	module.exports = function () {
		return {
			"getMatches": function (startDate, endDate) {
				return new Promise((resolve, reject) => {
					HLTV.getMatchesStats({ startDate: startDate, endDate: endDate }).then((matches) => {
						resolve(matches);
					}).catch(err => {
						reject(err);
					})
				})
			}
		}
	}
}())