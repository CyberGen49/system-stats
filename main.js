#!/usr/bin/node

const os = require('os');
const clc = require('cli-color');
const dayjs = require('dayjs');
const diskUsage = require('diskusage');
const args = require('yargs').argv;

// Compile arguments
const storagePaths = [ '/' ];
if (typeof args.storage === 'string') {
    storagePaths.push(args.storage);
} else if (typeof args.storage === 'object') {
    storagePaths.push(...args.storage);
}
const paddingSize = args.padding || 24;
const barLength = args.barlength || 30;

// Compile network interfaces
// https://stackoverflow.com/a/8440736
const nets = os.networkInterfaces();
const netInterfaces = [];
for (const name of Object.keys(nets)) {
    const result = {
        name: name, addresses: []
    };
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
        if (net.family === familyV4Value && !net.internal) {
            result.addresses.push(net.address);
        }
    }
    if (result.addresses.length)
        netInterfaces.push(result);
}

const roundSmart = (number, decimalPlaces = 0) => {
    const factorOfTen = Math.pow(10, decimalPlaces);
    return Math.round(number * factorOfTen) / factorOfTen;
}

const formatSize = (bytes) => {
    if (bytes < 1000) return `${bytes} B`;
    bytes /= 1024;
    if (bytes < (1000)) return `${roundSmart(bytes, 0)} KB`;
    bytes /= 1024;
    if (bytes < (1000)) return `${roundSmart(bytes, 1)} MB`;
    bytes /= 1024;
    if (bytes < (1000)) return `${roundSmart(bytes, 2)} GB`;
    bytes /= 1024;
    if (bytes < (1000)) return `${roundSmart(bytes, 2)} TB`;
    return "-";
}

const getRelativeDate = (target, anchor = Date.now()) => {
    const isFuture = (anchor-target < 0) ? true : false;
    let diff = Math.abs(anchor-target);
    diff = Math.round(diff/1000);
    if (diff < 120) // Less than 120 seconds
        return (isFuture) ? `In a moment` : `Moments ago`;
    diff = Math.round(diff/60);
    if (diff < 120) // Less than 120 minutes
        return (isFuture) ? `${diff} mins from now` : `${diff} mins ago`;
    diff = Math.round(diff/60);
    if (diff < 72) // Less than 72 hours
        return (isFuture) ? `${diff} hours from now` : `${diff} hours ago`;
    diff = Math.round(diff/24);
    const days = diff;
    return (isFuture) ? `${diff} days from now` : `${diff} days ago`;
}

const bar = (min, max, value) => {
    const percent = (value-min)/(max-min);
    const filled = Math.floor(barLength*percent);
    const empty = barLength-filled;
    let fillColour = 'greenBright';
    if (percent > 0.6) fillColour = 'yellowBright';
    if (percent > 0.8) fillColour = 'redBright';
    if (percent > 0.95) fillColour = 'red';
    return clc.blackBright(`[${clc[fillColour]('|'.repeat(filled))}${' '.repeat(empty)}]`);
};

async function main() {
    if (args.separate) console.log();
    // Output date and time
    console.log(clc.whiteBright(`System date and time:`.padEnd(paddingSize)), clc.cyanBright(dayjs().format(args.dtformat || 'YYYY-MM-DD H:mm:ss')));
    // Output uptime
    console.log(clc.whiteBright(`System uptime:`.padEnd(paddingSize)), clc.cyan(getRelativeDate(Date.now()-(os.uptime()*1000)).replace(' ago', '')));
    if (args.separate) console.log();
    // Output memory usage
    const memTotal = os.totalmem();
    const memFree = os.freemem();
    const memUsed = memTotal-memFree;
    console.log(
        clc.whiteBright(`Memory usage:`.padEnd(paddingSize)),
        clc.white(formatSize(memUsed).padStart(10)),
        bar(0, memTotal, memUsed),
        clc.white(formatSize(memTotal).padEnd(10))
    );
    // Output storage meters
    for (const storagePath of storagePaths) {
        const space = await diskUsage.check(storagePath);
        const spaceUsed = space.total-space.available;
        console.log(
            clc.whiteBright(`Usage of ${storagePath}:`.padEnd(paddingSize)),
            clc.white(formatSize(spaceUsed).padStart(10)),
            bar(0, space.total, spaceUsed),
            clc.white(formatSize(space.total).padEnd(10))
        );
    }
    if (args.separate) console.log();
    // Output network interfaces
    for (const netInterface of netInterfaces) {
        console.log(
            clc.whiteBright(`Addresses of ${netInterface.name}:`.padEnd(paddingSize)),
            clc.magentaBright(netInterface.addresses.join(', '))
        );
    }
    // Output public IP
    if (!args.nopublicip) {
        const res = await (await fetch('https://api.ipify.org?format=json')).json();
        console.log(clc.whiteBright(`Public IP:`.padEnd(paddingSize)), clc.magentaBright(res.ip));
    }
    if (args.separate) console.log();
}
main();