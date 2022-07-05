const { ethers } = require("hardhat");
const { expect, use } = require("chai");
const { solidity } = require("ethereum-waffle");
const { providers } = require("ethers");
use(solidity);

describe("Tesing of ERC721", ()=>{
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addrs;
    let tokcontract;
    let markcontract;

    beforeEach(async ()=>{
        [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
        const TokenContract = await ethers.getContractFactory("MYERC721");
        tokcontract = await TokenContract.deploy();
        await tokcontract.deployed();
        
        const MarketPlace = await ethers.getContractFactory("MarketPlace");
        markcontract = await MarketPlace.deploy(5, tokcontract.address);
        await markcontract.deployed();
        
    });
    describe("Testing TokenContract", ()=>{
        it("Test of Contructor", async ()=>{
            const Name = await tokcontract.name();
            const Symbol = await tokcontract.symbol();
            expect(Name).to.equal("MYERC721");
            expect(Symbol).to.equal("MET");
        })
    })
    describe("Erc721/mint", ()=>{
        it("Testing of Mint", async()=>{
            const tx = await tokcontract.mint("NA");
            await tx.wait();
            console.log(tx);
            const BAL = await tokcontract.balanceOf(owner.address);
            const OWNER = await tokcontract.ownerOf(1);
            const URI = await tokcontract.tokenURI(1);
            expect(BAL).to.equal(1);
            expect(OWNER).to.equal(owner.address);
            expect(URI).to.equal("NA");
        });
    });
    describe("Testing MarketPlace Contract", ()=>{
        beforeEach(async ()=>{
            const tx = await tokcontract.mint("NA");
            await tx.wait();
            const appr = await tokcontract.setApprovalForAll(markcontract.address, true);
            await appr.wait();

        });
        it("testing Marketplace/additem function", async ()=>{
            const balBefore = await tokcontract.balanceOf(owner.address);
            expect(balBefore).to.equal(1);
            const amount = ethers.utils.parseEther("1");
            await expect(markcontract.additem(1, amount)).to.emit(markcontract,"Sale").withArgs
            (owner.address, markcontract.address, 1);
            const balAfter = await tokcontract.balanceOf(owner.address);
            expect(balAfter).to.equal(0);
            const balAfter1 = await tokcontract.balanceOf(markcontract.address);
            expect(balAfter1).to.equal(1);
        });
        it("Testing MarketPlace/saleitem", async ()=>{
            const amount = ethers.utils.parseEther("1");
            const tx = await markcontract.additem(1, amount);
            await tx.wait();
            
            const amount1 = ethers.utils.parseEther("1.05")
            await expect(markcontract.saleitem(2)).to.be.revertedWith(" Not valid");
            const amount2 = ethers.utils.parseEther("1")
            await expect(markcontract.saleitem(1, {value: amount2 })).to.be.revertedWith("not enogh money for purchase");

            const balownbefore = await ethers.provider.getBalance(owner.address);
            await expect(markcontract.connect(addr3).saleitem(1, { value: amount1})).to.emit(markcontract,"Buy").withArgs(
                addr3.address,
                markcontract.address,
                1
            );
            const balownafter = await ethers.provider.getBalance(owner.address);
            expect(balownafter.sub(balownbefore)).to.equal(amount1);

            const bal1 = await tokcontract.balanceOf(owner.address);
            expect(bal1).to.equal(0);
            const bal2 = await tokcontract.balanceOf(addr3.address);
            expect(bal2).to.equal(1);
            await expect(markcontract.saleitem(1, {value: amount1 })).to.be.revertedWith("The Token is already sold");


        });
    });

});