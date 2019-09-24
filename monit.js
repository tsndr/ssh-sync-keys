const fs = require('fs')
const os = require('os')

const Client = require('ssh2').Client

// Connect to servers and get uptime
const hosts = JSON.parse(fs.readFileSync('config/hosts.json'))

for (const host of hosts) {
    const conn = new Client()
    conn.on('ready', () => {
        conn.exec('uptime', (err, stream) => {
            if (err) {
                console.error(`${host}: Can't connect!`)
                console.error(err)
                stream.close()
                return
            }
            stream.on('close', (code, signal) => {
                conn.end()
            }).on('data', data => {
                console.log(`${host}: ${data.toString().trim().split('load average: ', 2)[1]}`)
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data)
            })
        })
    }).connect({
        host,
        port: 22,
        username: 'root',
        privateKey: require('fs').readFileSync(os.homedir() + '/.ssh/id_rsa').toString()
    })
}