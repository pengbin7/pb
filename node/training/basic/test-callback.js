 function test(num,fn){
    console.log("exe test");
}

 function run(){
    test(1,function(){
        console.log('callback');
    })
}

var fs = require("fs");

fs.readFile('input.txt', function (err, data) {
    if (err) return console.error(err);
    console.log(data.toString());
});

console.log("程序执行结束!");

run();