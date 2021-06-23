const main = require("../../app");
module.exports = (req,res,parts)=>{
    if(parts.length<3){
        // Invalid arguments
        res.send(JSON.stringify({success:false,error:"Missing UUID"}));
        return;
    }

    let date = (new Date()).getMilliseconds();
    var uuid = parts[2].match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/);

    if(!uuid){
        res.send(JSON.stringify({success:false,error:"Malformed UUID"}));
        return;
    }

    switch(req.method){
        case "POST":
            // Writing something
            break;
        case "GET":
            // Getting something?
            main.pool.getConnection().then((conn)=>{
                conn.query(`SELECT * FROM \`player_chat\` WHERE \`uuid\`='${parts[2]}' ORDER BY \`id\` DESC ${req.query.limit!==undefined?`LIMIT `+req.query.limit:``};`).then(rows=>{
                    res.send(JSON.stringify({success:true,messages:rows,took:(new Date()).getMilliseconds()-date}));
                });
                conn.release();
            });
            break;
        default:
            // Unsupported method
            res.status(400);
            res.send(JSON.stringify({success:false,error:"Method not allowed"}));
            break;
    }

};