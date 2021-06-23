const main = require("../../app");
module.exports = (req,res,parts)=>{

    let date = (new Date()).getMilliseconds();

    switch(req.method){
        case "GET":
            // Getting something?
            switch (parts[3].toUpperCase()) {
                case "RECENT":
                    main.pool.getConnection().then((conn)=>{
                        conn.query(`SELECT \`id\`,\`username\`,\`uuid\` FROM \`players\` ORDER BY \`id\` DESC ${req.query.limit!==undefined?`LIMIT `+req.query.limit:``};`).then(rows=>{
                            res.send(JSON.stringify({success:true,players:rows,took:(new Date()).getMilliseconds()-date}));
                        });
                        conn.release();
                    });
                    break;
                case "PUNISHMENTS":
                    main.pool.getConnection().then((conn)=>{
                        conn.query(`SELECT \`id\`,\`punishment\`,\`player\` FROM \`punishments\` ORDER BY \`id\` DESC ${req.query.limit!==undefined?`LIMIT `+req.query.limit:``};`).then(rows=>{
                            res.send(JSON.stringify({success:true,punishments:rows,took:(new Date()).getMilliseconds()-date}));
                        });
                        conn.release();
                    });
                    break;
                case "CURRENT":
                    main.pool.getConnection().then((conn)=>{
                        conn.query(`SELECT \`id\` FROM \`player_reports\` WHERE \`closed\`='0';`).then(rows=>{
                            main.DaemonConnection.newRequest({action:"REFRESH_STATS"}).then((data)=>{
                                data['data']['reports']=rows.length;
                                res.send(JSON.stringify({success:true,data:data['data'],took:(new Date()).getMilliseconds()-date}));
                            }).catch(e=>{
                                res.send(JSON.stringify({success:false,error:e}));
                            })
                        });
                        conn.release();
                    });
                    break;
                default:
                    res.status(400);
                    res.send(JSON.stringify({success:false,error:"Invalid endpoint"}));
                    break
            }
            break;
        default:
            // Unsupported method
            res.status(400);
            res.send(JSON.stringify({success:false,error:"Method not allowed"}));
            break;
    }

};