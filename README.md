# ussd-pdu-text-converter
Convert GSM 7bit USSD from PDU to text and vice versa.

## Installation
    npm install ussd-pdu-text-converter
    
## Usage
ES6 syntax:
    
    import {UssdEncoderDecoder} from 'ussd-pdu-text-converter';

RequireJS syntax:

    var UssdEncoderDecoder = require('ussd-pdu-text-converter');

## API

#### `decodeAs7bitGSM(pdu:string) : string`
To decode a 7-bit GSM USSD PDU to text:
        
    UssdEncoderDecoder.decodeAs7bitGSM('C8329BFD065DDF72363904');

Output:
    
    Hello World

#### `encodeAs7bitGSM(text:string) : string`

To encode a text to 7-bit GSM USSD PDU:

    UssdEncoderDecoder.encodeAs7bitGSM('Hello World!')

Output:

    C8329BFD065DDF72363904
    
## Credits

[Froelich Stefan](https://github.com/frostymarvelous/USSD-PDU-Converters)
