/**
 * Simple mock server based on node.js with library express
 * @author Sarah Gebauer
 * @version 1.0.0
 */

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var conf = require('./conf.json');
var data = require('./mock.db.json');

app.use(bodyParser.json());

/**
 * Sends back all data
 */
app.get('/mock/show/', function(req, res) {
    res.send(data);
});

/**
 * Sends back either all data or only specified data
 */
app.get('/mock/show/:id', function(req, res) {
    if (req.params.id.toString().toLowerCase() == conf.allSymbol) {
        res.send(showAll());
    } else {
        var result = function(id) {
            for (var i = 0; i < data.items.length; i++ ) {
                if (data.items[i].id == id) {
                    return data.items[i];
                }
            }
            return {};
        };
        res.send(result(Number(req.params.id)));

    }
});

/**
 * Adds new record to database if task and dueDate fields are present
 */
app.post('/mock/add', function(req, res) {
    console.log(req.body);
    // required dueDate & task
    if (req.body.task.toString().length > 0 && Number(req.body.dueDate) >= (new Date()).getMilliseconds()) {
        var newItem = {};
        newItem.id = lowestPossibleId();
        newItem.dateCreated = new Date();
        newItem.dueDate = Number(req.body.dueDate);
        newItem.task = req.body.task;
        data.items.push(newItem);
        res.send({status: "ok", id: newItem.id});
    } else {
        res.send({status: "error"});
    }
});

/**
 * Deletes item from database. If it can't find it it simply tells that it has
 * been deleted
 */
app.delete('/mock/remove/:id', function(req, res) {
    for (var i = 0; i < data.items.length; i++) {
        if (req.params.id == data.items[i].id) {
            data.items.splice(i, 1);
            res.send({status: "deleted", id: req.params.id});
            return;
        }
    }
    res.send({status: "deleted"});
});

/**
 * Edits item in database but only editable fields
 */
app.put('/mock/edit/:id', function(req, res) {
    for (var i = 0; i < data.items.length; i++) {
        if (req.params.id == data.items[i].id) {
            if (req.body.task.toString().length > 0) {
                data.items[i].task = req.body.task;
                // task can never be an empty string
            }
            if (Number(req.body.dueDate) >= (new Date()).getMilliseconds()) {
                // cannot set deadlines to the past, sorry for that
                data.items[i].dueDate = req.body.dueDate;
            }
            res.send({status: "edited", item: data.items[i]});
            return;
        }
    }
    res.send({status: "error"});
});

/**
 * Starts the actual server
 */
app.listen(conf.port, function() {
    console.log("Mocks are listening at "+conf.port)
});

/**
 * showAll is responsible for returning data
 * @returns {JSON}
 */
var showAll = function() {
    return data;
};

/**
 * Finds available id
 * @returns {Number}
 */
var lowestPossibleId = function() {
    var highest = -1;
    for (var i = 0; i < data.items.length; i++ ) {
        if (data.items[i].id > highest) {
            highest = data.items[i].id;
        }
    }
    return highest+1;
}