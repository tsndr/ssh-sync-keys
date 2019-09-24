const fs = require('fs')
const os = require('os')
const path = require('path')

const Client = require('ssh2').Client

// Prepare keys
const keys = JSON.parse(fs.readFileSync('config/keys.json'))
const authKeys = []

for (const key of keys) {
    authKeys.push(`${key.key} ${key.name}`)
}

// Send keys to server
const hosts = JSON.parse(fs.readFileSync('config/hosts.json'))

for (const host of hosts) {
    const conn = new Client()
    conn.on('ready', () => {
        conn.exec(`echo "${authKeys.join("\n").replace('"', '\\"')}" > ~/.ssh/authorized_keys2`, (err, stream) => {
            if (err) {
                console.log(`❌ ${host}`)
                console.error(err)
                stream.close()
                return
            }
            console.log(`✅ ${host}`)
            stream.on('close', (code, signal) => {
                conn.end()
            }).on('data', data => {
                console.log(`${host}: ${data.toString().trim()}`)
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

    // const conn = new Client()
    // conn.on('ready', () => {
    //     conn.exec('uptime', (err, stream) => {
    //         if (err) {
    //             console.error(err)
    //             stream.close()
    //             return
    //         }
    //         stream.on('close', (code, signal) => {
    //             conn.end()
    //         }).on('data', data => {
    //             console.log(`${host}: ${data.toString().trim()}`)
    //         }).stderr.on('data', (data) => {
    //             console.log('STDERR: ' + data)
    //         })
    //     })
    // }).connect({
    //     host,
    //     port: 22,
    //     username: 'root',
    //     privateKey: require('fs').readFileSync(os.homedir() + '/.ssh/id_rsa').toString()
    // })
}