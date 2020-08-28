const fs = require('fs');
const { type } = require('os');
 
process.stdin.setEncoding('utf8');

// async function test(){
//     console.log('请输入下载的表情页数(1-600之间)：');
//     process.stdin.on('readable', () => {
//         var chunk = process.stdin.read();
//         if(Number.parseInt(chunk)){
//             console.log( 'yes');
//         }else{
//             console.log("no")
//         }
        
//     });
// }
const axios = require("axios");
const cheerio = require("cheerio");
let saveDir = "./表情库";
async function getNum(){
    let home = await axios.get("https://www.doutula.com/article/list/?page=1");
    let $ = cheerio.load(home.data);
    let length = $(".center-wrap .text-center li>a").length;
    let num = $(".center-wrap .text-center li>a").eq(length-2).text();
    return num;
}

async function run(){
    var num = await getNum();
    console.log(num);
}

run();