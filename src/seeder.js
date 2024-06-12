require('./app');
require('./connection/db');
const seeder = require('./seeder/seeder');
const seederModel = require('./models/seeder.model')
console.log('seeder-', seeder)
const {ACTIVE_STATUS} = require('./../config/key')
const promises = [];

seeder.forEach(async (seed) => {
    let seederFound = await seederModel.find({name: seed, status: ACTIVE_STATUS})

    if (seederFound.length < 1) {
        console.log('seed-', seed)
        let seederAdd = new seederModel();
        seederAdd.name = seed
        seederAdd.status = 1
        seederAdd.save();
        promises.push(require(`./seeder/${seed}Seeder.js`)
            .run());
    }
});

Promise.all(promises)
    .then(() => {
        console.log('promises----', promises)
        console.log('Seeders completed');
    }, (err) => {
        console.error('Seeder error', err);
    });