const cluster = require('cluster');

if(cluster.isWorker){
    console.log('Child thread');
}else{
    console.log('Parent thread');
    cluster.fork();
    cluster.fork();
}