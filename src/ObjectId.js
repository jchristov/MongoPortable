"use strict";
var _ = require("lodash");
var jsw_logger_1 = require("jsw-logger");
var binary_1 = require("./binary");
/**
 * Machine id.
 *
 * Create a random 3-byte value (i.e. unique for this
 * process). Other drivers use a md5 of the machine id here, but
 * that would mean an asyc call to gethostname, so we don"t bother.
 *
 * @ignore
 */
var MACHINE_ID = parseInt("" + Math.random() * 0xFFFFFF, 10);
// Regular expression that checks for hex value
var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
var isValidHexRegExp = function (str, len) {
    if (len === void 0) { len = 24; }
    if (str.length === len && checkForHexRegExp.test(str))
        return true;
    return false;
};
var pid;
try {
    if (_.isNil(process))
        pid = process.pid;
}
catch (e) {
    pid = Math.floor(Math.random() * 100000);
}
/**
 * ObjectId
 *
 * @module ObjectId
 * @since 0.0.1
 * @author Eduardo Astolfi <eastolfi91@gmail.com>
 * @copyright 2016 Eduardo Astolfi <eastolfi91@gmail.com>
 * @license MIT Licensed
 *
 * @classdesc Represents the BSON ObjectId type
 *
 * @param {string|number} id - Can be a 24 byte hex string, a 12 byte binary string or a Number.
 */
var ObjectId = (function () {
    function ObjectId(id) {
        // if (!(this instanceof ObjectId)) return new ObjectId(id, _hex);
        this._bsontype = "ObjectId";
        this.logger = jsw_logger_1.JSWLogger.instance;
        this.binaryParser = new binary_1.BinaryParser();
        if (_.isNil(id)) {
            this.id = this.generate();
        }
        else {
            if (_.isNumber(id)) {
                this.id = this.generate(id);
            }
            else {
                // String or Hex
                if (_.isString(id) && (id.length === 12 || id.length === 24)) {
                    if (isValidHexRegExp(id)) {
                        // Valid Hex
                        var _id = ObjectId.createFromHexString(id);
                        this.id = _id.id;
                    }
                    else if (id.length === 12) {
                        // Valid Byte String
                        this.id = id;
                    }
                    else {
                        this.logger.throw("Value passed in is not a valid 24 character hex string");
                    }
                }
                else {
                    this.logger.throw("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
                }
            }
        }
        if (ObjectId.cacheHexString) {
            this.__id = this.toHexString();
        }
    }
    /**
     * Return the ObjectId id as a 24 byte hex string representation
     *
     * @method ObjectId#toHexString
     *
     * @returns {String} The 24 byte hex string representation.
     */
    ObjectId.prototype.toHexString = function () {
        if (ObjectId.cacheHexString && this.__id)
            return this.__id;
        var hexString = "", number, value;
        for (var index = 0, len = this.id.length; index < len; index++) {
            value = this.binaryParser.toByte(parseInt(this.id[index])); // TODO
            number = value <= 15 ? "0" + value.toString(16) : value.toString(16);
            hexString = hexString + number;
        }
        if (ObjectId.cacheHexString) {
            this.__id = hexString;
        }
        return hexString;
    };
    /**
     * Alias for {@link ObjectId#toHexString}
     *
     * @method Cursor#next
     */
    ObjectId.prototype.toString = function () {
        return this.toHexString();
    };
    /**
     * Alias for {@link ObjectId#toHexString}
     *
     * @method Cursor#next
     */
    ObjectId.prototype.toJSON = function () {
        return this.toHexString();
    };
    /**
     * Update the ObjectId index used in generating new ObjectId"s on the driver
     *
     * @method ObjectId#get_inc
     * @private
     *
     * @returns {Number} Next index value.
     */
    ObjectId.prototype.getInc = function () {
        return ObjectId.index = (ObjectId.index + 1) % 0xFFFFFF;
    };
    /**
     * Generate a 12 byte id string used in ObjectId"s
     *
     * @method ObjectId#generate
     * @private
     *
     * @param {Number} [time] - Second based timestamp to the generation.
     *
     * @return {String} The 12 byte id binary string.
     */
    ObjectId.prototype.generate = function (time) {
        if (_.isNil(time) || !_.isNumber(time)) {
            time = Date.now() / 1000;
        }
        /* for time-based ObjectId the bytes following the time will be zeroed */
        var time4Bytes = this.binaryParser.encodeInt(time, 32, true, true);
        var machine3Bytes = this.binaryParser.encodeInt(MACHINE_ID, 24, false);
        var pid2Bytes = this.binaryParser.fromShort(pid);
        var index3Bytes = this.binaryParser.encodeInt(this.getInc(), 24, false, true);
        return time4Bytes + machine3Bytes + pid2Bytes + index3Bytes;
    };
    /**
     * Compares the equality of this ObjectId with [otherID].
     *
     * @method ObjectId#equals
     *
     * @param {Object} otherID - ObjectId instance to compare against.
     *
     * @returns {Boolean} The result of comparing two ObjectId"s
     */
    ObjectId.prototype.equals = function (otherID) {
        var id = (otherID instanceof ObjectId || otherID.toHexString) ? otherID.id : ObjectId.createFromHexString(otherID).id;
        return this.id === id;
    };
    /**
     * Returns the generation time in seconds that this ID was generated.
     *
     * @method ObjectId#getTimestamp
     *
     * @returns {Number} Number of seconds in the timestamp part of the 12 byte id.
     */
    ObjectId.prototype.getTimestamp = function () {
        var timestamp = new Date();
        timestamp.setTime(Math.floor(this.binaryParser.decodeInt(this.id.substring(0, 4), 32, true, true)) * 1000);
        return timestamp;
    };
    Object.defineProperty(ObjectId.prototype, "generationTime", {
        /* GETTER - SETTER */
        get: function () {
            return Math.floor(this.binaryParser.decodeInt(this.id.substring(0, 4), 32, true, true));
        },
        set: function (value) {
            value = this.binaryParser.encodeInt(value, 32, true, true);
            this.id = value + this.id.substr(4);
            // delete this.__id;
            this.toHexString();
        },
        enumerable: true,
        configurable: true
    });
    /* STATIC METHODS */
    /**
     * Creates an ObjectId from a hex string representation of an ObjectId.
     *
     * @method ObjectId#createFromHexString
     *
     * @param {String} hexString - An ObjectId 24 byte hexstring representation.
     *
     * @returns {ObjectId} The created ObjectId
     */
    ObjectId.createFromHexString = function (hexString) {
        // Throw an error if it"s not a valid setup
        if (_.isNil(hexString) || hexString.length != 24) {
            throw new Error("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters");
        }
        var len = hexString.length;
        var result = "", string, number;
        for (var index = 0; index < len; index += 2) {
            string = hexString.substr(index, 2);
            number = parseInt(string, 16);
            result += new binary_1.BinaryParser().fromByte(number);
        }
        return new ObjectId(result);
    };
    /**
     * Creates an ObjectId from a second based number, with the rest of the ObjectId zeroed out.
     * Used for comparisons or sorting the ObjectId.
     *
     * @method ObjectId#createFromTime
     *
     * @param {Number} time - A number of seconds.
     *
     * @returns {ObjectId} The created ObjectId
     */
    ObjectId.createFromTime = function (time) {
        var binaryParser = new binary_1.BinaryParser();
        var id = binaryParser.encodeInt(time, 32, true, true) + binaryParser.encodeInt(0, 64, true, true);
        return new ObjectId(id);
    };
    /**
     * Creates an ObjectId from a second based number, with the rest of the ObjectId zeroed out. Used for comparisons or sorting the ObjectId.
     *
     * @method ObjectId#createPk
     *
     * @param {Number} time an integer number representing a number of seconds.
     * @return {ObjectId} return the created ObjectId
     */
    ObjectId.createPk = function () {
        return new ObjectId();
    };
    return ObjectId;
}());
ObjectId.index = 0;
exports.ObjectId = ObjectId;

//# sourceMappingURL=ObjectId.js.map
