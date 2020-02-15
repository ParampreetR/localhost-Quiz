let cluster =  require('cluster')

const startWorker = () => {
    let createdWorker = cluster.fork()
    console.log('>Cluster:: New Worker Created - ' + createdWorker.id)
}

if(cluster.isMaster){
    require('os').cpus().forEach(() => {
        startWorker()
    })

    cluster.on('disconnect', (worker) => {
        console.log('>Cluster:: %d Worker Disconnected', worker.id)
    })

    cluster.on('exit', (worker, code, signal) => {
        console.log('>Cluster:: %d Worker Exit With code %d(%s)', worker.id, code, signal)
    })

}else{
    require('./server.js')()
}