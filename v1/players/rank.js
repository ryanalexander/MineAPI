const main = require("../../app");
module.exports = (req,res,parts,key)=>{
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
        case "PUT":
            // Writing something
            main.pool.getConnection().then((conn)=>{
                conn.query(`UPDATE \`players\` SET \`ranks\`='${req.body.rank}' WHERE \`uuid\`='${uuid}';`).then(rows=>{
                    res.send(JSON.stringify({success:true,res:rows,took:(new Date()).getMilliseconds()-date}));
                    main.DaemonConnection.setRank(uuid[0],req.body.rank.split(",")[0]);
                }).then(()=>{
                    conn.query(`INSERT INTO \`staff_audit\` (\`staff\`,\`action\`,\`target\`,\`timestamp\`,\`args\`) VALUES ('${key.owner}','SET_RANK','${uuid}',${new Date().getTime()},'${req.body.rank}')`)
                });
                conn.release();
            });
            break;
        case "GET":
            // Getting something?
            main.pool.getConnection().then((conn)=>{
                conn.query(`SELECT \`ranks\` FROM \`players\` WHERE \`uuid\`='${parts[2]}' LIMIT 1`).then(rows=>{
                    rows[0].ranks = rows[0].ranks.split(",");
                    res.send(JSON.stringify({success:true,rank:rows[0].ranks,took:(new Date()).getMilliseconds()-date}));
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