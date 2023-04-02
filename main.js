#!/usr/bin/node

const os = require('os');
const clc = require('cli-color');
const dayjs = require('dayjs');
const diskUsage = require('diskusage');
const utils = require('web-resources');

const bar = (min, max, value) => {
    const length = 30;
    const percent = (value-min)/(max-min);
    const filled = Math.floor(length*percent);
    const empty = length-filled;
    let fillColour = 'greenBright';
    if (percent > 0.6) fillColour = 'yellowBright';
    if (percent > 0.8) fillColour = 'redBright';
    if (percent > 0.95) fillColour = 'red';
    return clc.blackBright(`[${clc[fillColour]('|'.repeat(filled))}${' '.repeat(empty)}]`);
};

async function main() {
    console.log(clc.whiteBright(`System Date & Time:`.padEnd(20)), clc.cyanBright(dayjs().format('MMMM D YYYY, h:mm:ss A')));
    console.log(clc.whiteBright(`System uptime:`.padEnd(20)), clc.cyan(utils.getRelativeDate(Date.now()-(os.uptime()*1000)).replace(' ago', '')));
    const memTotal = os.totalmem();
    const memFree = os.freemem();
    const memUsed = memTotal-memFree;
    console.log(
        clc.whiteBright(`Memory usage:`.padEnd(20)),
        clc.white(utils.formatSize(memUsed).padStart(10)),
        bar(0, memTotal, memUsed),
        clc.white(utils.formatSize(memFree).padEnd(10)),
        clc.blackBright(`${utils.formatSize(memTotal)} total`)
    );
    const space = await diskUsage.check('/');
    const spaceUsed = space.total-space.available;
    console.log(
        clc.whiteBright(`Disk usage:`.padEnd(20)),
        clc.white(utils.formatSize(spaceUsed).padStart(10)),
        bar(0, space.total, spaceUsed),
        clc.white(utils.formatSize(space.available).padEnd(10)),
        clc.blackBright(`${utils.formatSize(space.total)} total`)
    );
}
main();