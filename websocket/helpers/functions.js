db = require('../db/db.js')

async function getHistory() {
    const res = await db.sql`select * from history`
    return res
}

async function addHistory(data) {
    const objHistory = {
        datestart: data.datestart,
        dateend: data.dateend,
        datetotal: data.datetotal,
        create_at: new Date(),
        parser: data.parser,
        payload: JSON.stringify(data.payload)
    }
    await db.sql`insert into history ${db.sql(objHistory, 'datestart', 'dateend', 'datetotal', 'create_at', 'parser', 'payload')}`
}

module.exports.getHistory = getHistory;
module.exports.addHistory = addHistory;