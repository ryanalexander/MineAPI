const main = require("../../app");
module.exports = async (req, res, parts) => {

    let date = (new Date()).getMilliseconds();

    switch (req.method) {
        case "GET":
            // Getting something?
            res.send(JSON.stringify({
                success: true, data: {
                    API: true,
                    Daemon: main.DaemonConnection != undefined ? main.DaemonConnection.socket.readable : false,
                    SQL: await isSQL()
                }
            }))
            break;
        default:
            // Unsupported method
            res.status(400);
            res.send(JSON.stringify({success: false, error: "Method not allowed"}));
            break;
    }

};

isSQL = async (cb) => {
    let sql = await main.pool.getConnection();
    if(sql.isValid()){
        sql.release();
        return true;
    }else {
        return false;
    }
}