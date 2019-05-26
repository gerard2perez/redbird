import { add } from 'os-service';
import { posix } from "path";

let OPTIONS = { 
    programPath: posix.join(__dirname, 'run.js'),
 };

add('@gerard2p-redbird', OPTIONS, function(error) {
    if (error) {
        console.trace(error);
    } else {
        console.log('@gerard2p-redbird service installed');
    }
});