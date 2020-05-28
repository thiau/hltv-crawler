(function () {
    "use strict";

    module.exports = function () {
        return {
            "getMainParameters": function (args) {
                let teamID = args[2].split("=")[1];
                let pages = args[3] ? args[3].split("=")[1] : 1;
                return {
                    "teamID": teamID,
                    "pages": pages
                }
            }
        }
    }
}())