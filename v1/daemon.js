const net = require("net");
module.exports = class {
    socket;
    requests = {
        0:(data)=>{}
    };
    constructor(host, port) {
        this.init(host,port);
    }

    init = (host, port)=>{
        this.socket = net.createConnection({ port: port, host: host }, () => {
            // 'connect' listener.
            console.log('connected to server!');
            this.socket.write(JSON.stringify({
                action: "AUTH",
                data: {
                    pass: "GrimsReallySecurePasswordIdea1337",
                    role: "API",
                    host: "127.0.0.1",
                    port: "80",
                    node: "MG-US1"
                }
            })+"\r\n");
        });
        this.socket.on('error',(e)=>{
            if(e.code==="ECONNREFUSED"){
                console.log('Failed to connect, retrying in 5 seconds');
                setTimeout(()=>this.init(host,port),5000);
            }
        })
        this.socket.on('data', this.read);
        this.socket.on('end', () => {
            console.log('Lost connection to server, retrying in 5 seconds');
            setTimeout(()=>this.init(host,port),5000);
        });
    }

    kickPlayer = (UUID, message)=>{
        this.writePacket({
            action: "KICK_PLAYER",
            data: {
                player: {
                    UUID: UUID
                },
                reason: message
            }
        })
    }

    sendMessage = (UUID, message)=>{
        this.writePacket({
            action: "SEND_MESSAGE",
            data: {
                player: {
                    UUID: UUID
                },
                message: message
            }
        })
    }

    setRank = (UUID, rank)=>{
        this.writePacket({
            action: "UPDATE_RANK",
            data: {
                player: {
                    UUID: UUID
                },
                rank: rank
            }
        })
    }

    locatePlayer = (UUID, reply)=>{
        this.newRequest({
            action: "LOCATE_PLAYER",
            data: {
                player: {
                    UUID: UUID
                }
            }
        }).then((e)=>reply({
            success: true,
            connection: e,
        })).catch((e)=>reply({
            success: false
        }));
    }

    newRequest = (payload)=>{
        return new Promise((resolve, reject)=>{
            payload['qid']=(Object.keys(this.requests).length+1);
            this.requests[payload['qid']]=resolve;
            this.writePacket(payload);
            setTimeout(()=>{
                if(this.requests[payload['qid']]!==null) {
                    reject("Operation timed out");
                    delete this.requests[payload['qid']];
                }
            },500);
        });
    }

    read = (line)=>{
        let payload = JSON.parse(line);
        console.log(payload);
        switch (payload['action']) {
            case "PING":
                this.writePacket({
                    action:"PONG"
                });
                break;
            case "SATISFY_REQUEST":
                // TODO
                let cb = this.requests[payload['qid']];
                if(cb !== undefined)cb(payload);
                delete this.requests[payload['qid']];
                break;
        }
    }

    write = (line) => {
        console.log("Sent "+line);
        this.socket.write(line+"\r\n");
    }
    writePacket = (obj) => {
        this.write(JSON.stringify(obj));
    }
}