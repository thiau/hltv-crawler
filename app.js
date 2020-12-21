(function () {
	"use strict";

	let fileHelper = require("./helpers/file")();
	const { HLTV } = require('hltv');

	// Crawl data

	HLTV.getMatchesStats({ startDate: '2020-01-01', endDate: '2020-12-11' }).then((res) => {
		fileHelper.saveJson(res, "matches_2020").then(data => {
			console.log("saved")
		}).catch(err => {
			console.log(err);
		})
	})

}())