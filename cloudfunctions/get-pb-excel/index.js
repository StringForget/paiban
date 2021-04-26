'use strict';
const xlsx = require('node-xlsx');//引入模块
const fs = require('fs');//
exports.main = async (event, context) => {
    console.log("Hello World")
    console.log(event)
    console.log(event["non-exist"])
    console.log(context)
    return event
};
