const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("RangeProof", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("RangeProofVerifer");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        // // This method is to create proof and public signal which will later be used in the verification process.
        const { proof, publicSignals } = await groth16.fullProve({"in":"10", "range":["10","0"]}, "contracts/circuits/RangeProof/RangeProof_js/RangeProof.wasm","contracts/circuits/RangeProof/circuit_final.zkey");

        console.log('1 =',publicSignals[0]);

        // to conver paramter from type string to bigint
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

        // to get the paramter which will be used in the solidity smart contract function
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        // to construct 4 paramters of the verify function in the groth16 contract
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;

        // const {proof, publicSignals} = await plonk.fullProve({"in1":"1","in2":"2", "in3":"3"},"contracts/circuits/RangeProof/RangeProof_js/RangeProof.wasm","contracts/circuits/RangeProof/circuit_final.zkey")

        // console.log('1x2x3 =',publicSignals);


        // const editedPublicSignals = unstringifyBigInts(publicSignals);
        // const editedProof = unstringifyBigInts(proof);
        // const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        // let parameterOne = calldata.split(",")[0]
        // let parameterTwo = [calldata.split(",")[1].slice(2,calldata.split(",")[1].length-2)]

        // expect(await verifier.verifyProof(parameterOne,parameterTwo)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});