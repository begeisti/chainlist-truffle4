// contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

// test suite
contract("ChainList", accounts => {
	var chainListInstance;
	var seller = accounts[1];
	var buyer = accounts[3];
	var articleName = "article 1";
	var articleDescription = "Description for article 1";
	var articlePrice = 10;

	// no article for sale yet
	it("should throw an exception if you try to buy an article when there is no article for sale yet", () => {
		return ChainList.deployed().then(instance => {
			chainListInstance = instance;
			return chainListInstance.buyArticle(1, {
				from: buyer,
				value: web3.toWei(articlePrice, "ether")
			});
		})
		.then(assert.fail)
		.catch(() => {
			assert(true);
		})
		.then(() => {
			return chainListInstance.getNumberOfArticles();
		})
		.then(numberOfArticles => {
			assert.equal(numberOfArticles.toNumber(), 0, "Number of articles must be 0!");
		});
	});

	// buy an article that does not exist
	it("should throw an exception if you try to buy an article that does not exist", async () => {
		chainListInstance = await ChainList.deployed();
		await chainListInstance.sellArticle(
			articleName,
			articleDescription,
			web3.toWei(articlePrice, "ether"),
			{ from: seller }
		);
		try {
			await chainListInstance.buyArticle(2, {from: buyer, value: web3.toWei(articlePrice, "ether")});
			assert(false);
		} catch (e) {
			assert(true);
		}
		const article = await chainListInstance.articles(1);
		assert.equal(article[0].toNumber(), 1, "Article ID must be 1");
		assert.equal(article[1], seller, "Seller must be " + seller);
		assert.equal(article[2], 0x0, "Buyer must be empty!");
		assert.equal(article[3], articleName, "Article name must be " + articleName);
		assert.equal(article[4], articleDescription, "Article description must be " + articleDescription);
		assert.equal(article[5].toNumber(), web3.toWei(articlePrice, "ether"), "Article price must be " + web3.toWei(articlePrice, "ether"));

	});

	it("should throw exception if you try to buy your own article", async () => {
		chainListInstance = await ChainList.deployed();
		try {
			await chainListInstance.buyArticle(1, { from: seller, value: web3.toWei(articlePrice, "ether") });
			assert(false);
		} catch {
			assert(true);
		}
		const article = await chainListInstance.articles(1);
		assert.equal(article[0].toNumber(), 1, "Article ID must be 1");
		assert.equal(article[1], seller, "Seller must be " + seller);
		assert.equal(article[2], 0x0, "Buyer must be empty!");
		assert.equal(article[3], articleName, "Article name must be " + articleName);
		assert.equal(article[4], articleDescription, "Article description must be " + articleDescription);
		assert.equal(article[5].toNumber(), web3.toWei(articlePrice, "ether"), "Article price must be " + web3.toWei(articlePrice, "ether"));
	});

	it("should throw exception if you try to buy an article with less price", async () => {
		chainListInstance = await ChainList.deployed();
		try {
			await chainListInstance.buyArticle(1, { from: seller, value: web3.toWei(articlePrice + 1, "ether") });
			assert(false);
		} catch {
			assert(true);
		}
		const article = await chainListInstance.articles(1);
		assert.equal(article[0].toNumber(), 1, "Article ID must be 1");
		assert.equal(article[1], seller, "Seller must be " + seller);
		assert.equal(article[2], 0x0, "Buyer must be empty!");
		assert.equal(article[3], articleName, "Article name must be " + articleName);
		assert.equal(article[4], articleDescription, "Article description must be " + articleDescription);
		assert.equal(article[5].toNumber(), web3.toWei(articlePrice, "ether"), "Article price must be " + web3.toWei(articlePrice, "ether"));
	});

	it("should throw an exception if the article that has already been sold", async () => {
		chainListInstance = await ChainList.deployed();
		await chainListInstance.buyArticle(1, { from: buyer, value: web3.toWei(articlePrice, "ether") });
		try {
			await chainListInstance.buyArticle(1, { from: web3.eth.accounts[0], value: web3.toWei(articlePrice, "ether") });
			assert(false);
		} catch {
			assert(true);
		}
		const article = await chainListInstance.articles(1);
		assert.equal(article[0].toNumber(), 1, "Article ID must be 1");
		assert.equal(article[1], seller, "Seller must be " + seller);
		assert.equal(article[2], buyer, "Buyer must be " + buyer);
		assert.equal(article[3], articleName, "Article name must be " + articleName);
		assert.equal(article[4], articleDescription, "Article description must be " + articleDescription);
		assert.equal(article[5].toNumber(), web3.toWei(articlePrice, "ether"), "Article price must be " + web3.toWei(articlePrice, "ether"));
	})
});