var express = require('express');
var app = express();
var query;
app.get('/dodaj/:num1/:num2', function (req, res) {
    // const num1 = +req.query.num1
    // const num2 = +req.query.num2 
    // const operation = req.query.operation
    var num1 = +req.params.num1;
    var num2 = +req.params.num2;
    var sum = num1 + num2;
    res.send(sum.toString());
    // if(operation == 'dodawanie') {
    //   const sum = num1 + num2
    //   res.send(sum.toString()) 
    // }
    // if(operation == 'odejmowanie') {
    //   const subtraction = num1 - num2
    //   res.send(subtraction.toString()) 
    // }
    // if(operation == 'mnozenie') {
    //   const multiplication = num1 * num2
    //   res.send(multiplication.toString()) 
    // }
    // if(operation == 'dzielenie') {
    //   const division = num1 / num2
    //   res.send(division.toString()) 
    // }  
});
app.listen(3000);
