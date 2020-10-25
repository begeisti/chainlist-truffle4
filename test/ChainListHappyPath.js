var ChainList = artifacts.require("./ChainList.sol");

// test suite
contract('ChainList', accounts => {

	var chainListInstance;
	var seller = accounts[1];
	var buyer = accounts[3];
	var articleName1 = "article 1";
	var articleDescription1 = "Description for article 1";
	var articlePrice1 = 10;
	var articleName2= "article 2";
	var articleDescription2 = "Description for article 2";
	var articlePrice2 = 20;
	var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
	var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

	it('should be initialized with empty values', () => {
		return ChainList.deployed().then(instance => {
			chainListInstance = instance;
			return instance.getNumberOfArticles();
		})
		.then(numberOfArticles => {
			assert.equal(numberOfArticles.toNumber(), 0, "Number of articles must be zero!");
			return chainListInstance.getArticlesForSale();
		})
		.then(articlesForSale => {
			assert.equal(articlesForSale.length, 0, "There should not be any article for sale");
		});
	});

	// sell a first article
	it("should let us sell a first article", () => {
		return ChainList.deployed().then(instance => {
			chainListInstance = instance;
			return chainListInstance.sellArticle(
				articleName1,
				articleDescription1,
				web3.toWei(articlePrice1, "ether"),
				{ from: seller }
			);
		})
		.then(receipt => {
			// check event
			assert.equal(receipt.logs.length, 1, "one event should have been triggered");
			assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
			assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1!");
			assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
			assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
			assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "article value must be " + web3.toWei(articlePrice1, "ether"));

			return chainListInstance.getNumberOfArticles();
		})
		.then(numberOfArticles => {
			assert.equal(numberOfArticles, 1, "Number of articles must be 1!");
			return chainListInstance.getArticlesForSale();
		})
		.then(articlesForSale => {
			assert.equal(articlesForSale.length, 1, "There must be 1 article for sale!");
			assert.equal(articlesForSale[0].toNumber(), 1, "Article id must be 1");
			return chainListInstance.articles(articlesForSale[0]);
		})
		.then(article => {
			assert.equal(article[0].toNumber(), 1, "Article ID must be 1");
			assert.equal(article[1], seller, "Seller must be " + seller);
			assert.equal(article[2], 0x0, "Buyer must be empty!");
			assert.equal(article[3], articleName1, "Article name must be " + articleName1);
			assert.equal(article[4], articleDescription1, "Article description must be " + articleDescription1);
			assert.equal(article[5].toNumber(), web3.toWei(articlePrice1, "ether"), "Article price must be " + web3.toWei(articlePrice1, "ether"));
		});
	});

	it("should let us sell a second article", () => {
		return ChainList.deployed().then(instance => {
			chainListInstance = instance;
			return chainListInstance.sellArticle(
				articleName2,
				articleDescription2,
				web3.toWei(articlePrice2, "ether"),
				{ from: seller }
			);
		})
		.then(receipt => {
			// check event
			assert.equal(receipt.logs.length, 1, "one event should have been triggered");
			assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
			assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2!");
			assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
			assert.equal(receipt.logs[0].args._name, articleName2, "event article name must be " + articleName2);
			assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, "ether"), "article value must be " + web3.toWei(articlePrice2, "ether"));

			return chainListInstance.getNumberOfArticles();
		})
		.then(numberOfArticles => {
			assert.equal(numberOfArticles, 2, "Number of articles must be 2!");
			return chainListInstance.getArticlesForSale();
		})
		.then(articlesForSale => {
			assert.equal(articlesForSale.length, 2, "There must be 2 articles for sale!");
			assert.equal(articlesForSale[0].toNumber(), 1, "Article id for the first article must be 1");
			assert.equal(articlesForSale[1].toNumber(), 2, "Article id for the second article must be 2");
			return chainListInstance.articles(articlesForSale[1]);
		})
		.then(article => {
			assert.equal(article[0].toNumber(), 2, "Article ID must be 2");
			assert.equal(article[1], seller, "Seller must be " + seller);
			assert.equal(article[2], 0x0, "Buyer must be empty!");
			assert.equal(article[3], articleName2, "Article name must be " + articleName2);
			assert.equal(article[4], articleDescription2, "Article description must be " + articleDescription2);
			assert.equal(article[5].toNumber(), web3.toWei(articlePrice2, "ether"), "Article price must be " + web3.toWei(articlePrice2, "ether"));
		});
	});

	// buy the first article
	it('should buy an article', () => {
		return ChainList.deployed().then(instance => {
			chainListInstance = instance;
			// record balances of seller & buyer before the buy
			sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
			buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
			return chainListInstance.buyArticle(1, {
				from: buyer,
				value: web3.toWei(articlePrice1, "ether")
			});
		})
		.then(receipt => {
			assert.equal(receipt.logs.length, 1, "one event should have been triggered");
			assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
			assert.equal(receipt.logs[0].args._id.toNumber(), 1, "Article id must be 1");
			assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
			assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
			assert.equal(receipt.logs[0].args._name, articleName1, "event article name must be " + articleName1);
			assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "article value must be " + web3.toWei(articlePrice1, "ether"));

			// record balances of buyer & seller after the buy
			sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
			buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

			// check the effect of buy on the balances of buyer & seller, accounting for gas
			assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned " + articlePrice1 + " ETH");
			// not will be the same because of gas price paid for calling the buy function
			assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have spent " + articlePrice1 + " ETH");

			return chainListInstance.getArticlesForSale();
		})
		.then(articlesForSale => {
			assert.equal(articlesForSale.length, 1, "There should now be 1 article left for sale!");
			assert.equal(articlesForSale[0].toNumber(), 2, "Article 2 should be the only article for sale!");
			return chainListInstance.getNumberOfArticles();
		})
		.then(numberOfArticles => {
			assert.equal(numberOfArticles.toNumber(), 2, "There should be still 2 articles in total");
		});
	});
});