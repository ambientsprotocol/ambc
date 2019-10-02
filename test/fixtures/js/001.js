/* String monoid */
let string_concat = () => (left, right) => left + right
let program = () => string_concat()("hello", "world")
program()
