import { run, stop } from 'os-service';
const [node,script,target] = process.argv;
process.argv.splice(1,1);
setTimeout(()=>{
    require(target);
},1 );
run(()=>{
    stop();
});