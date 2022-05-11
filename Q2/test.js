const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16 } = require("snarkjs");

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

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        // stating a proof and signals
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        console.log('1x2 =',publicSignals[0]);

        // changing string data type into integers
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        // passing the signal and proof into groth16 by call data method in Solidity which is used for calling external functions arguments
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        // stating 4 arguments for groth16 contract
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    let verifier1
    let verifier

    beforeEach(async function () {
        //[following script is for assignment] 
        verifier1 = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await verifier1.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[following script is for assignment] 
        
        const { proof, publicSignals } = await groth16.fullProve({"in1":"1","in2":"2", "in3":"2"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

        console.log('1x2x2 =',publicSignals[0]);

        const modifiedSignals = getInts(publicSignals);
        const modifiedProofSignal = getInts(proof);
        const getdata = await groth16.exportSolidityCallData(modifiedProofSignal, modifiedSignals);
    
        const argv = getdata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[following script is for assignment]
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    let verifier2
    let verifier

    beforeEach(async function () {
        //[following script is for assignment]
        verifier2 = await ethers.getContractFactory("PlonkVerifier");
        verifier = await verifier2.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[following script is for assignment]

        const {proof, publicSignals} = await plonk.fullProve({"in1":"1","in2":"2", "in3":"3"},"contracts/circuits/Multiplier3_Plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_Plonk/circuit_final.zkey")

        console.log('1x2x3 =',publicSignals);


        const modifiedSignals = getInts(publicSignals);
        const modifiedProofSignal = getInts(proof);
        const getdata = await plonk.exportSolidityCallData(modifiedProofSignal, modifiedSignals);

        let parameterOne = getdata.split(",")[0]
        let parameterTwo = [getdata.split(",")[1].slice(2,getdata.split(",")[1].length-2)]

        expect(await verifier.verifyProof(parameterOne,parameterTwo)).to.be.true;
    });


    it("Should return false for invalid proof", async function () {
        //[following script is for assignment]
        let parameterOne = "0x00"
        let parameterTwo = ["0x00"]

        expect(await verifier.verifyProof(parameterOne, parameterTwo)).to.be.false;
    });
});