const cheerio = require("cheerio");
const Bagpipe = require('bagpipe');
const axios = require("axios");
const request = require("request");
//var express = require("express");
//var app = express();

const fs = require("fs");
const { url } = require("inspector");
const e = require("express");
const { rejects } = require("assert");
const bagpipe = new Bagpipe(10);

let saveDir = "./表情库";

async function getNum(){
    let home = await axios.get("https://www.doutula.com/article/list/?page=1");
    let $ = cheerio.load(home.data);
    let length = $(".center-wrap .text-center li>a").length;
    let num = $(".center-wrap .text-center li>a").eq(length-2).text();
    return num;
}

process.stdin.setEncoding('utf8');
process.stdin.on('end', () => {
    process.stdout.write('end');
});

function spiler(num){
    process.stdout.write('请输入下载的表情页数(1-'+num+')：');
    process.stdin.on('readable', () => {
        var chunk = process.stdin.read();
        chunk = Number.parseInt(chunk);
        if(chunk){
            console.log('选择操作完成!下载即将开始下载'+chunk+'页表情包...');
            num = chunk;
        }else{
            console.log("输入不合法！下载即将开始，即将根据默认设置，下载10页表情包...")
            num = 10;
        }
        startSpiler(num);
    })
}

async function startSpiler(num){
    fs.mkdir(saveDir,function(err,data){
    });
    console.log("成功创建表情库！！！ 即将开始下载表情！！！！");
    for (let index = 1; index <= num; index++) {
         await getPageList(index);
    }
}

async function getPageList(num){
     let httpUrl = "https://www.doutula.com/article/list/?page=" + num;
     let res = await axios.get(httpUrl);
     let $ = cheerio.load(res.data);
     var elements = $('#home .col-sm-9>a');
     for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        let pageUrl = $(element).attr('href');
        let name = $(element).find('.random_title').text();
        let reg = /(.*?)\d/igs;
        let path = saveDir+"/"+reg.exec(name)[1];
        fs.mkdir(path,function(err,data){
            console.log("成功创建文件夹："+path);
        })
        await imgDetail(path,pageUrl);
     }
}

async function imgDetail(path,pageUrl){
    let res = await axios.get(pageUrl);
    let $ = cheerio.load(res.data);
    //类选择 类选择 标签 定位到详细地址
    var elements = $('.col-sm-9 .artile_des img');
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        let src = $(element).attr('src');
        var urlPath = src.split("\/");
        var imgUrl = urlPath[urlPath.length-1];
        var dest = path+"\/"+imgUrl;
        try{
            console.log("即将创建文件:"+dest);
            await download(src,dest,function(err, data){
                console.log("成功下载："+path+"\/"+imgUrl);
            })
        }catch(e){
            console.log("出错了："+e)
        }
    }
}

async function download(src, dest, callback) {
    request.head(src, function(err, res, body) {
		if (src) {
			request(src).pipe(fs.createWriteStream(dest,{autoClose:true})).on('close', function() {
				callback(null, dest);
            });
		}

	});

};

async function run(){
   var num = await getNum();
   spiler(num);
}

run();
