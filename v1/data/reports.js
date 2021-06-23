const main = require("../../app");
module.exports = (req,res,parts)=>{

    let date = (new Date()).getMilliseconds();

    switch(req.method){
        case "POST":
            // Writing something
            break;
        case "GET":
            // Getting something?
            main.pool.getConnection().then((conn)=>{
                conn.query(`SELECT * FROM \`player_reports\` WHERE \`closed\`='0' ORDER BY \`id\` DESC ${req.query.limit!==undefined?`LIMIT `+req.query.limit:``};`).then(rows=>{
                    res.send(JSON.stringify({success:true,reports:rows,took:(new Date()).getMilliseconds()-date}));
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