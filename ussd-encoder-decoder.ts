// see ftp://ftp.unicode.org/Public/MAPPINGS/ETSI/GSM0338.TXT
///<reference path="typings/index.d.ts"/>

import {stringify} from "querystring";
let GSM7BIT_DECODE = ['@', '\u00A3', '$', '\u00A5', '\u00E8', '\u00E9',
    '\u00F9', '\u00EC', '\u00F2', '\u00E7', '\n', '\u00D8', '\u00F8', '\r',
    '\u00C5', '\u00E5', '\u0394', '_', '\u03A6', '\u0393', '\u039B', '\u03A9',
    '\u03A0', '\u03A8', '\u03A3', '\u0398', '\u039E', '\u00A0', '\u00C6',
    '\u00E6', '\u00DF', '\u00C9', ' ', '!', '"', '#', '\u00A4', '%', '&', '\'',
    '(', ')', '*', '+', ',', '-', '.', '/', '0', '1', '2', '3', '4', '5', '6',
    '7', '8', '9', ':', ';', '<', '=', '>', '?', '\u00A1', 'A', 'B', 'C',
    'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
    'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '\u00C4', '\u00D6', '\u00D1',
    '\u00DC', '\u00A7', '\u00BF', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
    'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
    'y', 'z', '\u00E4', '\u00F6', '\u00F1', '\u00FC', '\u00E0'];

let GSM7BIT_ENCODE = (()=> {
    let map = {};
    GSM7BIT_DECODE.forEach(function (el, i) {
        map[el] = i;
    });
    return map;
})();

let NUMBER_FORMAT = {
    BIN: 2,
    DEC: 10,
    HEX: 16
};

let Utils = {
    convert: (string, from, to) => {
        return parseInt(string, from).toString(to);
    },
    convertArray: (array, from, to) => {
        array.forEach((el, i) => {
            let octet = Utils.convert(el, from, to);
            if (to === NUMBER_FORMAT.BIN && octet.length < 8) {
                octet = ('0000000' + octet).substr(-8);
            }
            array[i] = octet;
        });
        return array;
    },
    split: (string, format) => {
        let unmatch, match;
        if (format === NUMBER_FORMAT.BIN) {
            unmatch = /[^01]/gi;
            match = /[01]{1,8}/gi;
        } else if (format === NUMBER_FORMAT.HEX) {
            unmatch = /[^0-9a-f]/gi;
            match = /[0-9a-f]{1,2}/gi;
        }
        return (string.replace(unmatch, '')).match(match);
    }
};

export let UssdEncoderDecoder= {
    decodeAs7bitGSM: (hex) => {
        let octetArray = Utils.convertArray(Utils.split(hex, NUMBER_FORMAT.HEX), NUMBER_FORMAT.HEX, NUMBER_FORMAT.BIN);
        // unpack to 7bit
        let septetArray = [];
        for (let i = 0; i < octetArray.length; i++) {
            let septet = octetArray[i].substr((i % 7) + 1);
            if (i == 0) {
                septetArray.push(septet);
            } else {
                septet += octetArray[i - 1].substr(0, i % 7);
                septetArray.push(septet);
                if ((i > 1) && ((i + 1) % 7 === 0)) {
                    septet = octetArray[i].substr(0, 7);
                    septetArray.push(septet);
                }
            }
        }
        let charArray = [];
        septetArray.forEach((el, i) => {
            // map to gsm char
            charArray[i] = GSM7BIT_DECODE[parseInt(el, NUMBER_FORMAT.BIN)];
        });
        return charArray.join('');
    },
    encodeAs7bitGSM: (command:string):string => {

        function binhex(str:string):string {
            var decimalValue = parseInt(str, 2);
            return decimalValue.toString(16).toUpperCase();
        }

        function reverse(string:string):string {
            return string.split("").reverse().join("");
        }

        function repeat(ch:string, repeat:number):string {
            //char[] buf = new char[repeat];
            let buf: string[] = [];
            for (let i = repeat - 1; i >= 0; i--) {
                buf.push(ch) ;
            }
            return buf.join("");
        }

        function pad(string:string, padSize:number):string {
            //we only cater for 7 and 8
            let zeroPad:string = repeat('0', padSize);
            // if(string.length > padSize)
            //     throw new IllegalArgumentException(String.format("String length greater than specified padSize. %s : %d", string, string.length));

            let str:string = zeroPad.substring(string.length) + string;
            return str;
        }

        let bin:string = "";
        for(let i = 0; i < command.length; i++) {
            let ord:number = command.charAt(i).charCodeAt(0) ;
            let  binary:string = ord.toString(2);
            binary = pad(binary, 7);
            let reversed:string = reverse(binary);
            bin += reversed;
        }

        bin += repeat('0', 8 - (bin.length % 8));
        let pdu:string = "";
        while(bin.length > 0)
        {
            let symbol:string = bin.substring(0, 8);
            symbol = reverse(symbol);
            bin = bin.substring(8);
            pdu += binhex(symbol.substring(0,4)) + binhex(symbol.substring(4));
        }
        return pdu;
        //throw new Error('UNIMPLEMENTED_METHOD');
    }

};
