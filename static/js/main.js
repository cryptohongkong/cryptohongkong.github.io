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
        "itemToken": ""
    },
    "ropsten": {
        "nicks": "0x4749b95A106CC255C1DD986FbAdC7286D03c99ab",
        "itemToken": ""
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

var nickNameModalInput, ethOnOffLineIcon , nickNameSetButton 
,nickNameModal, nickNameModalSetButton;


$(document).ready(function() {
    // $('.model.warning>.button').click(function() {
    //     $('.modal.warning').modal('hide').modal('hide dimmer');
    // });
    nickNameModalInput = $( ".modal.nickname>.content>.input>input" );
    ethOnOffLineIcon = $('.app >.menu>.right>.icon');
    nickNameSetButton = $('.custom.popup>.ui.button');
    nickNameModal = $('.modal.nickname');
    nickNameModalSetButton = nickNameModal.find('.actions>.primary');
    nickNameModalSetButton.on('click',function(){
        if(nickNameModalInput.val().length!=0)
            setNickName(nickNameModalInput.val());
    });
    nickNameModalInput.on('input',function() {
        if(nickNameModalInput.val().length==0)
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
            $('.app >.menu>.right>.icon>.image').attr('src', './static/media/eth_online.1b5b9c81.svg');
            //enable set nickname
            $('.app >.menu>.right>.item>').popup({
                popup: $('.custom.popup'),
                position   : 'bottom left',
                on: 'click'
            });

            if (result)
                $('.app >.menu>.right>.item>.label').html(result);
            else
                $('.app >.menu>.right>.item>.label').html(currentAccount.substr(currentAccount.length - 6));

        } else {
            isOnline = false;
            $('.app >.menu>.right>.icon').attr('data-tooltip', 'offline').attr('data-position', 'bottom right');
            $('.app >.menu>.right>.icon>.image').attr('src', './static/media/eth_offline.079fadfb.svg');
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
    // web3.eth.getAccounts((err, acc) => {
    //     getCurrentAccount(acc);
    //     var currentAccount = web3.eth.defaultAccount;
    //     var nickName = document.getElementById("address").value;
    //     var nickNameContract = web3.eth.contract(nickABI);
    //     var nicks = nickNameContract.at(contractAddress[currentNet]["nicks"]);
    //     //  var nicknameSetEvent = nicks.Set({'_owner':web3.eth.defaultAccount}, {fromBlock: 0, toBlock: 'pending'});
    //     // console.log(nicknameSetEvent);
    //     nicks.set(nickName, function(error, txnHash) {
    //         if (!error) {
    //             if (txnHash) {
    //                 web3.eth.getTransactionReceiptMined(txnHash, 500).then(function(receipt) {
    //                     getNickName();
    //                 });
    //             } else
    //                 console.log("txnHash is empty");
    //         } else
    //             console.log(error);
    //     });
    // });

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

    // web3.eth.getAccounts((err, acc) => {
    //     //getCurrentAccount(acc);
    //     //getNickName();
    // });
    var accountInterval = setInterval(function() {
        if (web3.eth.accounts[0] !== currentAccount) {
            web3.eth.defaultAccount = web3.eth.accounts[0];
            currentAccount = web3.eth.defaultAccount;
            getNickName();
        }
    }, 100)
}