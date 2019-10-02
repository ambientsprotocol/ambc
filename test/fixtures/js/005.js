/* Assign a variable to a variable that has a function */
const a = () => "hello"
const b = a
const c = b
c()
