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
}())