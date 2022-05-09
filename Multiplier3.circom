pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals

template Multiplier2(){

   signal input a;
   signal input b;
   signal output c;

   c <== a * b;
}

template Multiplier3 () {  

   signal input a;
   signal input b;
   signal input d;
   signal output e;
   component mult1 = Multiplier2();
   component mult2 = Multiplier2();

   //Statements.
   mult1.a <== a;
   mult1.b <== b;
   mult2.a <== mult1.c;
   mult2.b <== d;
   e <== mult2.c;
}

component main = Multiplier3();
