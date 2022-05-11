pragma circom 2.0.0;

// [Assignment Below] 

template Multiplier3(){

   signal input vara;
   signal input varb;

   signal varc;

   signal input vard;
   signal output vare;

   // Constraints.
   varc <==vara*varb;
   vare <==vard*varc;
   //varc <==vara*varb*varc;
}
component main = Multiplier3();