(function () {
  "use strict";

  let fileHelper = require("../helpers/file")();
  const { HLTV } = require('hltv');

  // Crawl data

  // HLTV.getMatchesStats({ startDate: '2018-01-02', endDate: '2020-05-28' }).then((res) => {
  //   fileHelper.saveJson(res, "matches_2018_2020").then(data => {
  //     console.log("saved")
  //   }).catch(err => {
  //     console.log(err);
  //   })
  // })





  // fileHelper.loadFile("datasets/matches_2019_2020.json").then(data => {
  //   let matches = JSON.parse(data);
  //   let matchSchema = []

  //   // Parse Team Name
  //   matches.forEach(match => {
  //     matchSchema.push({
  //       "team1": match.team1.name,
  //       "team2": match.team2.name,
  //       "map": match.map,
  //       "team1win": match.result.team1 > match.result.team2 ? 1 : 0
  //     })
  //   })

  //   fileHelper.saveJson(matchSchema, "matches_parsed_2019_2020")

  // }).catch(err => {
  //   console.log(err);
  // });


  // // filter
  // fileHelper.loadFile("datasets/matches_2019_2020.json").then(data => {
  //   let matches = JSON.parse(data);
  //   let matchSchema = []
  //   // Parse Team Name
  //   matches.forEach(match => {
  //     if (match.team1.id == 6665 || match.team2.id == 6665) {
  //       matchSchema.push({
  //         "team2": match.team2.name,
  //         "map": match.map,
  //         "team1win": match.result.team1 > match.result.team2 ? 1 : 0
  //       })
  //     }
  //   })

  //   fileHelper.saveJson(matchSchema, "matches_parsed_2019_2020_filter")

  // }).catch(err => {
  //   console.log(err);
  // });



  // filter new
  fileHelper.loadFile("datasets/matches_2018_2020.json").then(data => {
    let matches = JSON.parse(data);
    let matchSchema = []
    let teamId = 6665
    // Parse Team Name
    matches.forEach(match => {

      if (match.team1.id == 6665 || match.team2.id == 6665) {
        let team1 = "";
        let team2 = "";
        let victory = "";
        // let team1 = match.team1.id == teamId ? match.team1.name : match.team2.name
        // let team2 = match.team1.id == teamId ? match.team2.name : match.team1.name

        if (match.team1.id == teamId) {
          team1 = match.team1.name
          team2 = match.team2.name
          victory = match.result.team1 > match.result.team2 ? 1 : 0
        } else {
          team1 = match.team2.name
          team2 = match.team1.name
          victory = match.result.team2 > match.result.team1 ? 1 : 0
        }

        matchSchema.push({
          "team2": team2,
          "map": match.map,
          "team1win": victory
        })
      }
    })

    fileHelper.saveJson(matchSchema, "matches_parsed_2018_2020_filter")

  }).catch(err => {
    console.log(err);
  });


}())