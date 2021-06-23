const main = require("../../app");

module.exports = (req,res,parts,key)=>{
    if(parts.length<3){
        // Invalid arguments
        res.send(JSON.stringify({success:false,error:"Missing UUID"}));
        return;
    }
    var date = new Date().getMilliseconds();

    var uuid = parts[2].match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/);

    if(parts.length===3){
        switch(req.method){
            case "GET":
                // Getting something?
                main.pool.getConnection().then(conn=>{
                    conn.query(`SELECT \`uuid\`,\`username\`,\`ranks\`,\`first_joined\`,\`last_seen\`,\`experience\`,\`tokens\`,\`badges\`,\`last_ip\` FROM \`players\` WHERE ${uuid?`\`uuid\`='${parts[2]}'`:`\`username\`='${parts[2]}'`} LIMIT 1;`).then(rows=>{

                        rows[0].ranks = rows[0].ranks.split(",");

                        main.DaemonConnection.locatePlayer(rows[0]['uuid'],(reply)=>{
                            res.send(JSON.stringify({
                                success: true,
                                connection: reply.connection.data,
                                player: rows[0],
                                took: date-new Date().getMilliseconds()
                            }))
                        });
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
    }else {
        try {
            require("./"+parts[3].toLowerCase())(req,res,parts,key);
        }catch (e) {
            if(e.code==="MODULE_NOT_FOUND") {
                res.status(404);
                res.send(JSON.stringify({success: false, error: "Endpoint not found"}));
            }else {
                res.status(500);
                res.send(JSON.stringify({success: false, error: e.code}));
            }
        }
    }

};