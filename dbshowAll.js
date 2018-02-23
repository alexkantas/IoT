// Libraries 
const MongoClient = require('mongodb').MongoClient;
//
const mongoURL = 'mongodb://localhost:27017/';

let allProjects;
let allUsers = [];

MongoClient.connect(mongoURL,(err,mongoClient)=>{
    let db1 = mongoClient.db('kantasnet');
    let col1 = db1.collection('projects');
    col1.find().toArray((err,projects)=>{
        if(err) return console.log(err);
        allProjects = projects;
    });
    let db2 = mongoClient.db('thesis');
    let col2 = db2.collection('users');
    col2.find().toArray((err,users)=>{
        if(err) return console.log(err);
        console.log(users);
        allUsers = users;
    });
    
    let db3 = mongoClient.db('cinema');
    let col3 = db3.collection('users');
    col3.find({role:''}).toArray((err,users)=>{
        if(err) return console.log(err);
        console.log(users);
        allUsers.push(...users);
        mongoClient.close();
        setTimeout(afterWait,100);
    });

})

function afterWait(){
    // console.log('Projects are',allProjects);
    console.log('All users are',JSON.stringify(allUsers));
}