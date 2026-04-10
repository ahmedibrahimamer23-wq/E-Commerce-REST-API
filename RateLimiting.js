const  rateLimit = require('express-rate-limit');
const express = require('express');
const app = express();

const limiter = rateLimit({
    windowMs: 15*60*1000,
    limit: 100,
    message: 'We have receive many of requests from this IP..'
});

module.exports =  limiter;