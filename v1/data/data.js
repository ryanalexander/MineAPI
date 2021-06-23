const main = require("../../app");

module.exports = (req,res,parts)=>{
    var date = new Date().getMilliseconds();

    try {
        require("./"+parts[2].toLowerCase())(req,res,parts);
    }catch (e) {
        if(e.code==="MODULE_NOT_FOUND") {
            res.status(404);
            res.send(JSON.stringify({success: false, error: "Endpoint not found"}));
        }else {
            res.status(500);
            res.send(JSON.stringify({success: false, error: e.code}));
            console.log(e);
        }
    }

};