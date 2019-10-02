/*
let a = "foo"       // value, constant [006]
let b = () => "foo" // function, no arguments, constant expression [002, 003, 004, 005, 007]
let c = b()         // value, variable expression [007]
let d = (x) => x    // function, 1 argument, argument expression
let e = d("foo")    // value, function variable expression, constant expression
let f = (x) => x()  // function, 1 argument, function argument expression
let g = f(b)        // value, function and value variable expressions
 */
