const app = require('express')();
const bodyParser = require('body-parser');
const DaemonHandler = require('./v1/daemon');
const cors = require('cors')
const mariadb = require('mariadb');
const fs = require('fs');

exports.DaemonConnection = new DaemonHandler(fs.existsSync("./production")?"10.0.0.4":"127.0.0.1",12605);

//app.use(bodyParser.urlencoded({extended:true}));
app.use(require('express').json());
app.use(cors());

exports.pool = mariadb.createPool({
    host: fs.existsSync("./production")?"10.0.0.6":"",
    user: "redacted",
    password: "",
    database: "games"
});

app.use('/*', (req, res)=>{
    var parts = req.baseUrl.split("/").splice(1);
    res.header("Access-Control-Allow-Origin","*");
    res.header("Content-type","application/json");

    if(parts.length===0){
        res.send(JSON.stringify({status:"online"}))
        return;
    }

    // Validate API Key
    if(req.query.key===undefined||req.query.key.length!==36){
        // Invalid API Key
        res.status(403);
        res.send(JSON.stringify({success:false,error:"Invalid API Key"}));
        return;
    }

    this.pool.getConnection().then((conn)=>{
        conn.query(`SELECT \`access\`,\`owner\` FROM \`api_key\` WHERE \`key\`='${req.query.key}' LIMIT 1;`).then((result)=>{
            if(result.length===0){
                res.status(403);
                res.send(JSON.stringify({success:false,error:"Invalid API Key"}));
            }else {
                if((req.method==="POST"||req.method==="PUT"||req.method==="DELETE")&&result[0].access.indexOf("WRITE")<=-1){
                    // Disallowed method for key
                    res.status(403);
                    res.send(JSON.stringify({success:false,error:"Method not allowed"}));
                    return;
                }
                switch (parts[0].toUpperCase()) {
                    case "V1":
                        require("./v1/api")(req,res,parts,result[0]);
                        break;
                    default:
                        res.status(404);
                        res.send(JSON.stringify({success:false,error:"Invalid API Version"}));
                        break;
                }
            }
        });
        conn.release();
    })
});

app.get((req,res)=>{
    res.send(JSON.stringify({
        success:false,
        error:"Endpoint non existent"
    }));
});

app.listen(80)