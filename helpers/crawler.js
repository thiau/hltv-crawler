(function () {
    "use strict";

    let fileHelper = require("./file")();
	const { HLTV } = require('hltv');
    
    module.exports = function () {
        return {
            "getMatchData": function (startDate, endDate) {
                return new Promise((resolve, reject) => {
                    HLTV.getMatchesStats({ startDate: startDate, endDate: endDate }).then((res) => {
                        return resolve({
                            "status": "Success",
                            "count": res.length
                        })
                    }).catch(err => {
                        return reject({
                            "status": "Failure",
                            "err": err
                        })
                    })
                })
                
            }
        }
    }

	// // Crawl data

	// console.log("Crawling Data...")
	// HLTV.getMatchesStats({ startDate: '2020-01-01', endDate: '2020-12-31' }).then((res) => {
	// 	console.log(`\nTotal matches found: ${res.length}`)
	// 	let date = new Date().getTime();
	// 	let fileName = `matches_${date}`;
	// 	fileHelper.saveJson(res, fileName).then(data => {
	// 		console.log("\nFile saved")
	// 	}).catch(err => {
	// 		console.log(err);
	// 	})
	// })
}())