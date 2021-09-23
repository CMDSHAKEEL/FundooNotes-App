const express = require('express');
const bodyParser = require('body-parser');
const PORT =8000;
const  { graphqlHTTP } = require('express-graphql');
const  { buildSchema }  =require('graphql');
const Event =require('./models/events')

const app = express();
const events =[];


app.use(bodyParser.json());

// Configuring the database
const dbConfig = require('./config/database.config');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

app.use('/graphql', graphqlHTTP ({
    schema: buildSchema(`  
        type Event {
            _id:ID!
            firstName:String!
            lastName:String!
            email:String!
            Address : String!
        }
        input EventInput {
            _id:ID!
            firstName:String!
            lastName:String!
            email:String!
            Address : String!
         }

    type RootQuery{
        events : [Event!]!

     }

     type RootMutation {
        createEvents(eventInput : EventInput):Event
     }
        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue:{
        events:()=>{
         return Event.find()
          .then(events=>{
              return events.map(event=>{
                  return {...event._doc}
              })
          })
          .catch(err=>{
              throw err
          })
        },
        createEvents:(args)=>{
          
            const event = new Event({
                title: args.eventInput.title,
                     firstName: args.eventInput.firstName,
                     lastName: args.eventInput.lastName,
                     email: args.eventInput.email,
                     Address: args.eventInput.Address,
            })
           return event
            .save()
            .then(result=>{
                console.log(result);
                return { ...result._doc };
            })
            .catch(err=>{
                console.log(err);
                throw err;
            });
        }
    },
    graphiql :true
})
);

app.listen(PORT ,()=>{
console.log(`server is listening port ${PORT}`)
});