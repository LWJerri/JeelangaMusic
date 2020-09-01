'use strict';

class Util {
    constructor() { throw Error("Don't make instace") };

    /**
     * 
     * @param {string} message 
     * @param {number} length 
     */
    static split(message, length = 2040) {
        return message.length > length ? message.substr(0, length - 3) + '...' : message;
    };
};

module.exports = Util;