window.addEventListener('load', function() {
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
    checkNetwork(window.web3);
    startApp(window.web3);
});




function checkNetwork(web3) {
    web3.version.getNetwork((err, netId) => {
        switch (netId) {
            case "1":
                currentNet = "mainnet";
                console.log('This is mainnet')
                break
            case "2":
                //TO-DO: Pop Up to Test User this is a deprecated network.
                // And User cannot do any transactions.
                console.log('This is the deprecated Morden test network.')
                break
            case "3":
                currentNet = "ropsten";
                //TO-DO: Tell user is ropsten test network
                console.log('This is the ropsten test network.')
                break
            case "4":
                //TO-DO:  Pop Up to Test User this is a deprecated network.
                // And User cannot do any transactions.
                console.log('This is the Rinkeby test network.')
                break
            case "42":
                //TO-DO:  Pop Up to Test User this is a deprecated network.
                // And User cannot do any transactions.
                console.log('This is the Kovan test network.')
                break
            default:
                //TO-DO:  Pop Up to Test User this is a deprecated network.
                // And User cannot do any transactions.
                currentNet = "testnet";
                console.log('This is an unknown network.')
        }
    })
}

function getNickName() {
    var nickNameContract = web3.eth.contract(nickABI);
    var nicks = nickNameContract.at(contractAddress[currentNet]["nicks"]);
    nicks.nickOf(web3.eth.defaultAccount, function(error, result) {
        if (!error) {
            document.getElementById("output").innerHTML = result;
            console.log(result);
        } else
            console.log(error);
    });
}

function getCurrentAccount(accounts) {
    if(accounts!=null && accounts.length >0)
    {
        web3.eth.defaultAccount = accounts[0];
        //TO-DO: If eth is offline set online
    }
    else
    {
        console.log("Accounts is null or accounts array is empty");
        //TO-DO: Handle the case, thell user you do not have account, ask 
        //them to register or whatever...
        //if eth is online set offline
    }
}

function setNickName() {
    web3.eth.getAccounts((err, acc) => {
            getCurrentAccount(acc);
            var nickName =  document.getElementById("address").value;
            var nickNameContract = web3.eth.contract(nickABI);
            var nicks = nickNameContract.at(contractAddress[currentNet]["nicks"]);
            nicks.set(nickName, function(error, result) {
            if (!error) {
                console.log(result);
                nicks.nickOf(web3.eth.defaultAccount, function(error, result) {
                    if (!error) {
                        document.getElementById("output").innerHTML = result;
                        console.log(result);
                    } else
                        console.log(error);
                });
            } else
                console.log(error);
        });
    });
}

function startApp(web3) {
    web3.eth.getAccounts((err, acc) => {
        getCurrentAccount(acc);
        getNickName();
    });
}
var currentNet="ropsten";
var contractAddress = { 
    "mainnet": 
        {
            "nicks":"0x80Acc3604EF04Db9a46e78F725bFe422F7E8eCE6",
            "itemToken":""
        }, 
    "testnet": 
        {
            "nicks":"0x80Acc3604EF04Db9a46e78F725bFe422F7E8eCE6",
            "itemToken":""
        }
    , 
    "ropsten": 
        {
            "nicks":"0x998645774B5aA534A83e39515AbF2C41A0dCdEe0",
            "itemToken":""
        } 
    };


















