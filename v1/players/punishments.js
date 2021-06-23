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
        case "DELETE":
            // Delete something
            main.pool.getConnection().then((conn)=>{
                conn.query(`DELETE FROM \`punishments\` WHERE \`id\`='${req.body.id}'`).then(rows=>{
                    res.send(JSON.stringify({success:true,res:rows,took:(new Date()).getMilliseconds()-date}));
                })
                conn.release();
            });
            break;
        case "PUT":
            // Writing something
            main.pool.getConnection().then((conn)=>{
                conn.query(`INSERT INTO \`punishments\` (\`punishment\`, \`player\`, \`admin\`, \`issued\`, \`expires\`,
                                                         \`reason\`, \`comment\`)
                            VALUES ('${req.body.type}','${uuid}','${key.owner}','${new Date().getTime()}','-1','${req.body.reason}','${req.body.notes}');`).then(rows=>{
                    res.send(JSON.stringify({success:true,res:rows,took:(new Date()).getMilliseconds()-date}));
                }).then(()=>{
                    conn.query(`INSERT INTO \`staff_audit\` (\`staff\`,\`action\`,\`target\`,\`timestamp\`,\`args\`) VALUES ('${key.owner}','${req.body.type}','${uuid}',${new Date().getTime()},'${req.body.reason}')`)
                });
                conn.release();
            });

            if(req.body.type==="BAN")main.DaemonConnection.kickPlayer(uuid[0],`&cYou have been banned from the MineGames Network.\n\n&7Reason: &f${req.body.reason}\n&7Reference: &f??\n\n&7May may appeal this ban here...\n&ehttps://mcg.gg/appeal`);
            if(req.body.type==="KICK"){
                console.log("Kicking player");
                main.DaemonConnection.kickPlayer(uuid[0],`&cYou have been kicked from the MineGames Network.\n\n&7Reason: &f${req.body.reason}\n\n&7You may still reconnect.`);
            }
            if(req.body.type==="WARN"){
                main.DaemonConnection.sendMessage(uuid[0],`&c<!> &7You have been warned for &f${req.body.reason}&7.`)
            }
            if(req.body.type==="MUTE")main.DaemonConnection.sendMessage(uuid[0],`TODO Mute message`);

            break;
        case "GET":
            // Getting something?
            if(!isNaN(parts[4])){
                main.pool.getConnection().then((conn) => {
                    conn.query(`SELECT * FROM \`punishments\` WHERE \`player\`='${parts[2]}' AND \`id\`='${parts[4]}' ORDER BY \`id\` DESC LIMIT 1;`).then(rows => {
                        res.send(JSON.stringify({
                            success: true,
                            punishments: rows,
                            took: (new Date()).getMilliseconds() - date
                        }));
                    });
                    conn.release();
                });
            }else {
                main.pool.getConnection().then((conn) => {
                    conn.query(`SELECT * FROM \`punishments\` WHERE \`player\`='${parts[2]}' ORDER BY \`id\` DESC ${req.query.limit !== undefined ? `LIMIT ` + req.query.limit : ``};`).then(rows => {
                        res.send(JSON.stringify({
                            success: true,
                            punishments: rows,
                            took: (new Date()).getMilliseconds() - date
                        }));
                    });
                    conn.release();
                });
            }
            break;
        default:
            // Unsupported method
            res.status(400);
            res.send(JSON.stringify({success:false,error:"Method not allowed"}));
            break;
    }

};