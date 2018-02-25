var currentNet = "ropsten";
var isOnline = false;
var currentAccount = "";
var contractAddress = {
    "mainnet": {
        "nicks": "0x80Acc3604EF04Db9a46e78F725bFe422F7E8eCE6",
        "itemToken": ""
    },
    "testnet": {
        "nicks": "0x998645774B5aA534A83e39515AbF2C41A0dCdEe0",
        "itemToken": "0xa0978cb0d2c21517293bb752bf7fa69484eb170c"
    },
    "ropsten": {
        "nicks": "0x4749b95A106CC255C1DD986FbAdC7286D03c99ab",
        "itemToken": "0xa35bd8671C1858d09622d4AEF92E4f025962B8D6"
    }
};

$(window).on('load', function() {
    if (typeof web3 !== 'undefined') {
        console.log('Web3 Detected! ' + web3.currentProvider.constructor.name)
        window.web3 = new Web3(web3.currentProvider);
    } else {
        //console.log('No Web3 Detected... using HTTP Provider')
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        //TO-DO
        //Pop Up Model And Ask User download MetaMask       
        console.log('No web3? You should consider trying MetaMask!');


    }
    window.web3.eth.getTransactionReceiptMined = getTransactionReceiptMined;
    checkNetwork(window.web3);

});

var nickNameModalInput, ethOnOffLineIcon, nickNameSetButton, nickNameModal, nickNameModalSetButton;


$(document).ready(function() {
    // $('.model.warning>.button').click(function() {
    //     $('.modal.warning').modal('hide').modal('hide dimmer');
    // });
    nickNameModalInput = $(".modal.nickname>.content>.input>input");
    ethOnOffLineIcon = $('.app >.menu>.right>.icon');
    nickNameSetButton = $('.custom.popup>.ui.button');
    nickNameModal = $('.modal.nickname');
    nickNameModalSetButton = nickNameModal.find('.actions>.primary');
    nickNameModalSetButton.on('click', function() {
        if (nickNameModalInput.val().length != 0)
            setNickName(nickNameModalInput.val());
    });
    nickNameModalInput.on('input', function() {
        if (nickNameModalInput.val().length == 0)
            nickNameModalSetButton.addClass('disabled').prop("disabled", true);
        else
            nickNameModalSetButton.removeClass('disabled').prop("disabled", false);
    });
    ethOnOffLineIcon.attr('data-tooltip', 'offline').attr('data-position', 'bottom right');
    nickNameSetButton.click(function() {
        nickNameModal.modal('show');

    });

});

var getTransactionReceiptMined = function getTransactionReceiptMined(txHash, interval) {
    const self = this;
    const transactionReceiptAsync = function(resolve, reject) {
        self.getTransactionReceipt(txHash, (error, receipt) => {
            if (error) {
                reject(error);
            } else if (receipt == null) {
                setTimeout(
                    () => transactionReceiptAsync(resolve, reject),
                    interval ? interval : 500);
            } else {
                resolve(receipt);
            }
        });
    };

    if (Array.isArray(txHash)) {
        return Promise.all(txHash.map(
            oneTxHash => self.getTransactionReceiptMined(oneTxHash, interval)));
    } else if (typeof txHash === "string") {
        return new Promise(transactionReceiptAsync);
    } else {
        throw new Error("Invalid Type: " + txHash);
    }
};


function checkNetwork(web3) {
    web3.version.getNetwork((err, netId) => {
        var warning = '<div class="ui error message"><div class="header">Not Connected</div><div class="content">CryptoCountries requires a Web3 browser to use like MetaMask or Mist</div></div>';
        $(".ui.error.message").remove();
        switch (netId) {
            case "1":
                currentNet = "mainnet";
                break
            case "2":
                //deprecated Morden test network
                currentNet = "";
                $(warning).insertAfter(".ui.huge.topbar.menu");
                $(".marketplace").remove();
                $('.modal.warning>.content').html('no confing for network: deprecated Morden test network');
                $('.modal.warning').modal('show');
                break
            case "3":
                //Ropsten tet network
                currentNet = "ropsten";
                warning = '<div class="ui error message"><div class="header">Test Network</div><div class="content">Your are using currently on a test network "ropsten".</div></div>';
                $(warning).insertAfter(".ui.huge.topbar.menu");
                break
            case "4":
                //Rinkeby test network
                currentNet = "";
                $(warning).insertAfter(".ui.huge.topbar.menu");
                $(".marketplace").remove();
                $('.modal.warning>.content').html('no confing for network: Rinkeby test network');
                $('.modal.warning').modal('show');
                break
            case "42":
                //Kovan test network
                currentNet = "";
                $(warning).insertAfter(".ui.huge.topbar.menu");
                $(".marketplace").remove();
                $('.modal.warning>.content').html('no confing for network: Kovan test network');
                $('.modal.warning').modal('show');
                break
            default:
                //local test network
                currentNet = "testnet";
                warning = '<div class="ui error message"><div class="header">Not Connected</div><div class="content">Your are using currently on a test network "</div></div>';
                $(warning).insertAfter(".ui.huge.topbar.menu");

        }
        if (currentNet) {
            startApp();
        }
    })
}


function getNickName() {
    var nickNameContract = web3.eth.contract(nickABI);
    var nicks = nickNameContract.at(contractAddress[currentNet]["nicks"]);
    nicks.nickOf(currentAccount, function(error, result) {
        if (!error) {
            isOnline = true;
            $('.app >.menu>.right>.icon').attr('data-tooltip', 'online').attr('data-position', 'bottom right');
            $('.app >.menu>.right>.icon>.image').attr('src', '/static/media/eth_online.svg');
            //enable set nickname
            $('.app >.menu>.right>.item>').popup({
                popup: $('.custom.popup'),
                position: 'bottom left',
                on: 'click'
            });

            if (result)
                $('.app >.menu>.right>.item>.label').html(result);
            else
                $('.app >.menu>.right>.item>.label').html(currentAccount.substr(currentAccount.length - 6));

        } else {
            isOnline = false;
            $('.app >.menu>.right>.icon').attr('data-tooltip', 'offline').attr('data-position', 'bottom right');
            $('.app >.menu>.right>.icon>.image').attr('src', '/static/media/eth_offline.svg');
            //console.log(error);
        }
    });
}

// function getCurrentAccount(accounts) {
//     if (accounts != null && accounts.length > 0) {
//         web3.eth.defaultAccount = accounts[0];
//         //If eth is offline set online
//         if (!isOnline) {

//             isOnline = !isOnline;
//         }

//     } else {
//         console.log("Accounts is null or accounts array is empty");
//         //TO-DO: Handle the case, tell user you do not have account, ask 
//         //them to register or whatever...
//         //if eth is online set offline
//     }
// }



function setNickName(nickname) {

    nickNameModal.find('.dimmer').dimmer('show');
    var nickNameContract = web3.eth.contract(nickABI);
    var nicks = nickNameContract.at(contractAddress[currentNet]["nicks"]);
    //  var nicknameSetEvent = nicks.Set({'_owner':web3.eth.defaultAccount}, {fromBlock: 0, toBlock: 'pending'});
    // console.log(nicknameSetEvent);
    nicks.set(nickname, function(error, txnHash) {
        if (!error) {
            if (txnHash) {
                web3.eth.getTransactionReceiptMined(txnHash, 500).then(function(receipt) {
                    nickNameModal.find('.dimmer').dimmer('show');
                    getNickName();
                    nickNameModal.modal('hide');
                });
            } else
                console.log("txnHash is empty");
        } else
            console.log("setNickName Error:" + error);
    });
}

function startApp() {
    initUI();

    // web3.eth.getAccounts((err, acc) => {
    //     //getCurrentAccount(acc);
    //     //getNickName();
    // });
    var refreshAccount = function() {
        if (web3.eth.accounts[0] !== currentAccount) {
            web3.eth.defaultAccount = web3.eth.accounts[0];
            currentAccount = web3.eth.defaultAccount;
            getNickName();
        }
    };
    refreshAccount();
    var accountInterval = setInterval(refreshAccount, 100);
    adminOperaion();
}

function initUI() {
    var cardsNode = $(".cards");

    for (var i = 0; i < hk18districts.length; i++) {
        var districtName = hk18districts[i]['code'];
        var imageURL = '/static/media/district/' + districtName.split(" ").join('_') + '_District_logo.svg';
        var wikiURL = "https://en.wikipedia.org/wiki/" + districtName.split(" ").join('_') + '_District';
        var ownerName = 'cryptohongkong';

        var currentPrice = 24 + ' ETH';
        var tranactionPending = $('<div class="ui dimmer"><div class="content"><div class="center"><div class="ui text loader">Transaction Pending</div></div></div><!--end content--></div>');
        //var card = 
        var cardNode = $('<div></div>').appendTo(cardsNode).addClass("ui card dimmable country-card");
        cardNode.append(tranactionPending);
        var cardContent = $('<div></div>').addClass('content country-card-bg');
        var districtImage = $('<img></img>').addClass('ui rounded left floated image')
            .attr('src',  imageURL).css("height", "40px");
        var cardHeader = $('<div></div>').addClass('left aligned header').css("margin-top", "10px")
            .html('<a href="'+wikiURL+'" target="_blank">'+districtName+'</a>');
        var cardOwner = $('<div></div>').addClass('content country-card-owner')
            .css("background-color", "rgb(157, 39, 207)")
            .css("color", "rgb(0, 0, 0)");
        var owner = $('<span></span>').html("Owner: " + ownerName).css('font-size', '0.9em').css("letter-spacing", "1.5");
        cardOwner.append(owner);
        var extraContent = $('<div></div>').addClass('center aligned content')
            .appendTo($('<div></div>').addClass('extra content'))
            .append($('<div class="ui large left labeled button" role="button" tabindex="0"><a class="ui basic label">' +
                currentPrice + '</a><button class="ui primary button" role="button">Buy</button></div>'));
        cardContent.append(districtImage);
        cardContent.append(cardHeader);
        cardNode.append(cardContent);

        cardNode.append(cardOwner);
        cardNode.append(extraContent);
    }
}

function buy(itemID)
{
    var itemTokenContract = web3.eth.contract(itemTokenABI);
    var ItemToken = itemTokenContract.at(contractAddress[currentNet]["itemToken"]);

}
function adminOperaion() {

    var itemTokenContract = web3.eth.contract(itemTokenABI);
    var ItemToken = itemTokenContract.at(contractAddress[currentNet]["itemToken"]);
    //var number = new BigNumber(1);
    //var number2 = new BigNumber(1000000000000000);
    var price = 1000000000000000; // 0.001 ether
    console.log(web3.fromWei('2105263157894736', 'ether'));
    var nextPrice = web3.fromWei('2105263157894736', 'ether');
    console.log(web3.toWei(nextPrice, 'ether'));
    //test set item function
    // ItemToken.listMultipleItems([4],1000000000000000,currentAccount,function(error, result){
    //     if(!error){
    //         console.log(result);
    //     } else
    //     {
    //         console.error(error);
    //     }
    // });
    // ItemToken.buy(4,{gas:30000,from:currentAccount,value:web3.toWei(nextPrice,'ether')},function(error,result){
    //     if(!error){
    //         console.log(result);
    //     } else
    //     {
    //         console.error(error);
    //     }
    // })
}