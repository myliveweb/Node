db = require('../db/db.js')

async function getHistory() {
    const res = await db.sql`select * from history`
    return res
}

async function addHistory(data) {
    // const now = new Date()
    // const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()+3, now.getMinutes(), now.getSeconds())
    const objHistory = {
        datestart: 0,
        dateend: 0,
        datetotal: 0,
        create_at: new Date(),
        parser: data.parser,
        payload: data.payload
    }
    await db.sql`insert into history ${db.sql(objHistory, 'datestart', 'dateend', 'datetotal', 'create_at', 'parser', 'payload')}`
}

module.exports.getHistory = getHistory;
module.exports.addHistory = addHistory;