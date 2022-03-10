const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 15;
    let instance = await StarNotary.deployed();
    let symbol = "Star";
    await instance.createStar('Awesome Star!', tokenId, symbol, { from: accounts[0] });
    // assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
    const starInfo = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(starInfo.name, 'Awesome Star!');
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let symbol = "Star";
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, symbol, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    let symbol = "Star";
    await instance.createStar('awesome star', starId, symbol, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let symbol = "Star";
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, symbol, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let symbol = "Star";
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, symbol, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    let starID = 50;
    let starName = 'my star23';
    let starSymbol = 'MS11';
    // 1. create a Star with different tokenId
    //await instance.createStar(starName, starID, starSymbol).send({ from: accounts[0] });
    await instance.createStar(starName, starID, starSymbol, { from: accounts[0] });
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const starInfo = await instance.tokenIdToStarInfo.call(starID);
    assert.equal(starInfo.name, starName);
    assert.equal(starInfo.symbol, starSymbol);
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    // 1. create 2 Stars with different tokenId
    let starID1 = 6;
    let starID2 = 7;
    let starName1 = 'my star';
    let starName2 = 'my star2';
    let starSymbol1 = 'MS';
    let starSymbol2 = 'MS2';
    await instance.createStar(starName1, starID1, starSymbol1, { from: accounts[0] });
    await instance.createStar(starName2, starID2, starSymbol2, { from: accounts[1] });
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starID1, starID2, { from: accounts[0] });
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(starID1), accounts[1]);
    assert.equal(await instance.ownerOf.call(starID2), accounts[0]);

});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let starIDTest1 = 16;
    let starNameTest1 = 'lookUpStarInfo test';
    let starSymbolTest1 = 'ls';
    await instance.createStar(starNameTest1, starIDTest1, starSymbolTest1, { from: accounts[0] });
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(accounts[1], starIDTest1, { from: accounts[0] });
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(starIDTest1), accounts[1]);
});

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();
    let starIDTest = 11;
    let starNameTest = 'lookUpStarInfo test';
    let starSymbolTest = 'ls';
    // 1. create a Star with different tokenId
    await instance.createStar(starNameTest, starIDTest, starSymbolTest, { from: accounts[0] });
    // 2. Call your method lookUptokenIdToStarInfo
    let starName = await instance.lookUptokenIdToStarInfo(starIDTest);
    // 3. Verify if you Star name is the same
    assert.equal(starName, starNameTest);
});