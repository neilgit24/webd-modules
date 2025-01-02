let num = document.getElementById('show');
function put(input){num.value += input;}
function clear_all(){num.value = '';}
function result(){num.value = eval(num.value);}