let got = require('got');
let CronJob = require('cron').CronJob;
let low = require('lowdb')
let FileSync = require('lowdb/adapters/FileSync')
let moment = require('moment')
let fs = require("fs");

async function getWaterRegimen(){
    let response = await got('http://www.cjh.com.cn/sqindex.html');
    let body = response.body;

    let json = /sssq = (\[.*\])/.exec(body)[1]
    let obj = JSON.parse(json)

    let list = []

    for(let i of obj){
        list.push({
            入流量: Number(i.oq),
            出流量:Number(i.q),
            区域:i.rvnm,
            站名:i.stnm,
            时间:i.tm,
            水位:Number(i.z)
        })

        if(i.stnm == '三峡水库'){
            let time = moment(i.tm).tz("Asia/Shanghai");
            let sanxia = '"'+time.format('YYYY-MM-DD HH:mm:ss')+'",'+Number(i.oq)+','+Number(i.q)+','+Number(i.z)+'\n'
            fs.appendFileSync('sanxia.csv',sanxia)
            console.log(time.format)
        }

        if(i.stnm == '汉口'){
            let time = moment(i.tm).tz("Asia/Shanghai");
            let sanxia = '"'+time.format('YYYY-MM-DD HH:mm:ss')+'",'+Number(i.oq)+','+Number(i.q)+','+Number(i.z)+'\n'
            fs.appendFileSync('hankou.csv',sanxia)
        }
    }


    const adapter = new FileSync('db.json')
    const db = low(adapter)

    db.defaults({ data:[] })
        .write()

    db.get('data')
        .push({list,time:Date.now()})
        .write()

}

//let job = new CronJob('0 20 * * * *', getWaterRegimen);
//job.start();

getWaterRegimen()