const request = require('request');
const io = require('socket.io-client');

let online = 0;
let messageTotalCount = 0;

// 开启房间数
const rooms = 500;

// 开始房间计数
const ss = 0;

// 每个房间参与者人数
const ps = 9;

var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

function generateMixed(n) {
     var res = "";
     for(var i = 0; i < n ; i ++) {
         var id = Math.ceil(Math.random()*35);
         res += chars[id];
     }
     return res;
}

async function run() {
    for(let i = ss; i < ss + rooms; i++) {
        await newMeeting(i);
    }
}

run();

async function newMeeting(i) {
    let meetingId = 1000 + i;
    let token = await login(meetingId);
    // 主讲人进入房间
    createMeeting(meetingId, token);

    // 参会人员进入房间
    for (let k = 0; k < ps; k++) {
        let id = 1500 + (i - ss) * ps + k
        let token = await login(id);
        joinMeeting(meetingId, token);
    }
}

// 参会人员进入房间
function joinMeeting(meetingId, token) {
    let socket = io(`ws://ws.test`, {
        query: {
            meetingId,
            token
        },
        reconnectionDelay: 1000,            // 重试延迟 1s
        timeout: 1000 * 6 * 3,              // 连接超时 3m
        reconnectionAttempts: 3,            // 重连次数 3p
        transports: ['websocket']
    });
    partner(socket);
}

// 主讲人创建会议
function createMeeting(meetingId, token) {
    let socket = io(`ws://ws.test`, {
        query: {
            meetingId,
            token
        },
        reconnectionDelay: 1000,            // 重试延迟 1s
        timeout: 1000 * 6 * 3,              // 连接超时 3m
        reconnectionAttempts: 3,            // 重连次数 3p
        transports: ['websocket']
    });
    speaker(socket);
}

// 主讲人
function speaker(socket) {
    socket.on('connect', function(){
        online++;
        console.log("有用户上线, 当前在线测试人数:" + online);
    });

    setInterval(randDraw, GetRandomNum(1800, 2500), socket);

    socket.on('disconnect', function(){
        online--;
        console.log("有用户下线, 当前在线测试人数:" + online);
    });
}

// 随机画
function randDraw(socket) {
    let cid = generateMixed(32);
    let rand = Math.random();
    let tool = rand > 0.66 ? 'arrow' : rand > 0.33 ? 'pencil' : 'line';
    switch(tool) {
        case 'line':
        case 'arrow':
            socket.emit('SYNC', {
                tool, 
                sync: {
                    attrs: {
                        color: '#000000',
                        opacity: 0.8,
                        thickness: 20
                    },
                    divisor: 5,
                    end: {
                        x: GetRandomNum(100, 1400),
                        y: GetRandomNum(100, 800)
                    },
                    start: {
                        x: GetRandomNum(100, 1400),
                        y: GetRandomNum(100, 800)
                    },
                    cid
                }
            }
        );
            setTimeout(drawing, 40, tool, socket, cid);
            break;
        default:
            socket.emit('SYNC', {tool, sync: {
                divisor: 5,
                attrs: {
                    color: '#000000',
                    opacity: 0.8,
                    thickness: 20
                },
                points: [{
                    x: GetRandomNum(100, 1400),
                    y: GetRandomNum(100, 800)
                }],
                cid
            }});
            setTimeout(drawing, 40, tool, socket, cid);
            break;
    }
}

// 中途点
function drawing(tool, socket, cid) {
    let count = 20;
    let ing = setInterval(function() {
        count--;
        if(count <= 0) {
            clearInterval(ing);
            switch(tool) {
                case 'pencil':
                    // 画线
                    socket.emit('SYNC_END', {sync: {
                        points: [{
                            x: GetRandomNum(100, 1400),
                            y: GetRandomNum(100, 800)
                        }],
                        cid
                    }});
                    break;
                case 'line':
                case 'arrow':
                    // 画箭头
                    socket.emit('SYNC_END', {sync: {
                        end: {
                            x: GetRandomNum(100, 1400),
                            y: GetRandomNum(100, 800)
                        },
                        cid
                    }});
                    break;
            }
        } else {
            switch(tool) {
                case 'pencil':
                    // 画线
                    socket.emit('SYNC', {sync: {
                        points: [{
                            x: GetRandomNum(100, 1400),
                            y: GetRandomNum(100, 800)
                        }]
                    }});
                    break;
                case 'line':
                case 'arrow':
                    // 画箭头
                    socket.emit('SYNC', {sync: {
                        end: {
                            x: GetRandomNum(100, 1400),
                            y: GetRandomNum(100, 800)
                        }
                    }});
                    break;
            }
        }
    }, 40);
}

// 获取随机数
function GetRandomNum(Min, Max){   
    let Range = Max - Min;   
    let Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
}   

// 参与者
function partner(socket) {
    socket.on('connect', function(){
        online++;
        console.log("有用户上线, 当前在线测试人数:" + online);
    });

    // 收到一条消息
    socket.on('SYNC', function(data){
        messageTotalCount++;
        // console.log("收到一条消息,一共收到: " + messageTotalCount + " 条了!");
    });

    // 收到一条消息
    socket.on('SYNC_END', function(data){
        messageTotalCount++;
        // console.log("收到一条消息,一共收到: " + messageTotalCount + " 条了!");
    });

    socket.on('disconnect', function(){
        online--;
        console.log("有用户下线, 当前在线测试人数:" + online);
    });
}

// 用户登录
function login (account) {
    return new Promise((resolve, reject) => {
        request({
            url: 'http://api.test/account/login',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: {account:'account-' + account, password:'123456'}
        }, (err, httpResponse, body) => {
            if (err || !body.data || !body.data.access_token) {
                return reject();
            }
            resolve(body.data.access_token);
        });
    })
}