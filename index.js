var express = require('express');
var app = express();
var query;
app.get('/', function (req, res) {
    var num1 = +req.query.num1;
    var num2 = +req.query.num2;
    var operation = req.query.operation;
    if (operation == 'dodawanie') {
        var sum = num1 + num2;
        res.send(sum.toString());
    }
    if (operation == 'odejmowanie') {
        var subtraction = num1 - num2;
        res.send(subtraction.toString());
    }
    if (operation == 'mnozenie') {
        var multiplication = num1 * num2;
        res.send(multiplication.toString());
    }
    if (operation == 'dzielenie') {
        var division = num1 / num2;
        res.send(division.toString());
    }
});
app.listen(3000);
