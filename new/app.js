(function () {
    "use strict";

    let fileHelper = require("../helpers/file")();

    const { HLTV } = require('hltv');

    // Crawl data

    HLTV.getMatchesStats({startDate: '2019-01-02', endDate: '2020-05-28'}).then((res) => {
      fileHelper.saveJson(res,"matches_2019_2020").then(data => {
        console.log("saved")
      }).catch(err => {
        console.log(err);
      })
    })





    // fileHelper.loadFile("datasets/matches_2020.json").then(data => {
    //   let matches = JSON.parse(data);
    //   console.log(matches.length)
    //   // let matchSchema = []

    //   // // Parse Team Name
    //   // matches.forEach(match => {
    //   //   matchSchema.push({
    //   //     "team1": match.team1.name,
    //   //     "team2": match.team2.name,
    //   //     "map": match.map,
    //   //     "team1win": match.result.team1 > match.result.team2 ? 1 : 0
    //   //   })
    //   // })

    //   // fileHelper.saveJson(matchSchema, "matches_parsed_2019_2020")

    // }).catch(err => {
    //   console.log(err);
    // });
    
}())