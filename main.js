const express = require('express');
const Joi = require('joi');
const fs = require('fs');

var app = express();
app.use(express.json());

// Array of people
var people = [
    {id: 1, name: "Person1"},
    {id: 2, name: "Person2"},
    {id: 3, name: "Person3"},
    {id: 4, name: "Person4"}
];


// Home page
app.get('/', (req, res) => {
    fs.readFile('./views/index.html', null, (error, data) => {
        // Check if this file exists
        if(error) return res.status(404).send('File not found!');
        // Render this html file
        res.write(data);
        res.end();
    });
});

// Send all people from the people array to the client
app.get('/people', (req, res) => {
    res.send(people);
});

// Send specific person from the people array to the client
app.get('/people/:id', (req, res) => {
    // Find person in array
    let person = people.find(x => x.id === parseInt(req.params.id));

    // If a person does not exist in array, response with 400 status code
    if(!person) return res.status(400).send('Person with this ID, was not found');

    // Else return to client
    res.send(person);
});

// Add new person in people array
app.post('/people', (req, res) => {
    // Validate new person
    let result = validatePerson(req.body);

    // If person's attributes are not valid, send error message to the client 
    if(result.error) return res.send(result.error.details[0].message);

    // Else add person in people array
    let person = {
        id: people.length + 1,
        name: req.body.name
    };
    people.push(person);

    // Send this person to the client as response
    res.send(person);
});

// Update a person in people array
app.put('/people/:id', (req, res) => {
    // Check if this person exists in people array
    let person = people.find(x => x.id === parseInt(req.params.id));
    if(!person) return res.status(400).send('Person with this ID, was not found');

    // If so, check if new name is valid
    let result = validatePerson(req.body);
    if(result.error) return res.send(result.error.details[0].message);

    // If name is valid, update person and send person to the client as response
    person.name = req.body.name;
    res.send(person);
});

// Delete a person in people array
app.delete('/people/:id', (req, res) => {
    // Check if person with this id does exist in people array
    let person = people.find(x => x.id === parseInt(req.params.id));
    if(!person) return res.status(404).send('Person with this ID, was not found');

    // If so, delete this person
    let indexOfPerson = people.indexOf(person);
    people.splice(indexOfPerson, 1);

    // Send person to the client as response
    res.send(person);
});


//#region Methods
let validatePerson = (personBody) => {
    let schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return schema.validate(personBody);
}
//#endregion


// Open server
var port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening server on port ${port}...`));