pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "./matMul.circom"; // hint: you can use more than one templates in circomlib-matrix to help you

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here

    component mult = matMul(n,n,1);
    component res = IsEqual();

    var given_sum = 0;
    var calc_sum = 0;


    for(var i=0; i<n; i++){
        for(var j=0; j<n ; j++){
            mult.a[i][j] <== A[i][j];
        }
        
    }

    for(var i=0; i<n; i++){
        mult.b[i][0] <== b[i];
    }

    for(var i=0; i<n; i++){
        calc_sum = given_sum + mult.out[i][0];
        given_sum = calc_sum + b[i];
    }

    res.in[0] <== calc_sum;
    res.in[1] <== given_sum;

    out <== res.out;

}

component main {public [A, b]} = SystemOfEquations(3);