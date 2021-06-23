const main = require("../app");
module.exports = (req,res,parts,key)=>{
    if(parts.length<2){
        // Invalid arguments
        res.send(JSON.stringify({success:false,error:"No endpoint specified"}));
        return;
    }

    switch(parts[1].toUpperCase()){
        case "PLAYERS":
            require("./players/players")(req,res,parts,key);
            break;
        case "BULK_UUID":
            var uuids = req.query.players;
            var date = new Date().getTime();
            var string = "";
            uuids.split(",").forEach(id=>{
                string+="OR `uuid`='"+id+"' "
            });
            main.pool.getConnection().then(conn=>{
                conn.query(`SELECT \`uuid\`,\`username\` FROM \`players\` WHERE ${string.substring(2,string.length)}`).then(rows=>{
                    res.send(JSON.stringify({success:true,data:rows,took:(new Date()).getMilliseconds()-date}));
                });
                conn.release();
            });
            break;
        case "DATA":
            require("./data/data")(req,res,parts,key);
            break;
        case "SERVERS":
            res.send(JSON.stringify({success:true,error:"Servers endpoint working!"}));
            break;
        default:
            res.send(JSON.stringify({success:false,error:"Invalid endpoint specified"}));
            break;
    }
};