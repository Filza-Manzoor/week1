pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template LessThan10() {
    signal input a;
    signal output b;

    component less_than_10 = LessThan(32); 

    less_than_10.a[0] <== a;
    less_than_10.a[1] <== 10;

    b <== less_than_10.b;
}

component main = LessThan10();