var currentNet = "mainnet";
var isOnline = false;
var isWarning = false;
var currentAccount = "";


$(window).on('load', function() {
    if (typeof web3 !== 'undefined') {
        console.log('Web3 Detected! ' + web3.currentProvider.constructor.name)
        window.web3 = new Web3(web3.currentProvider);
        window.web3.eth.getTransactionReceiptMined = getTransactionReceiptMined;
        checkNetwork(window.web3);
    } else {
        //console.log('No Web3 Detected... using HTTP Provider')
        window.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/GlEMBFCzgHACj3nE8XY"));
        initMap();
        //console.log('No web3? You should consider trying MetaMask!');
        var warning = '<div class="ui error message"><div class="header">Not Connected</div><div class="content">Cryptohongkong requires a Web3 browser to use like MetaMask</div></div>';
        $(warning).insertAfter(".ui.huge.topbar.menu");
    }


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

var nickNameModalInput, ethOnOffLineIcon, nickNameSetButton, nickNameModal, nickNameModalSetButton, txnWarnModal;


$(document).ready(function() {
    nickNameModalInput = $(".modal.nickname>.content>.input>input");
    ethOnOffLineIcon = $('.app >.menu>.right>.icon');
    nickNameSetButton = $('.custom.popup>.ui.button');
    nickNameModal = $('.modal.nickname');
    txnWarnModal = $('.modal.txnwarnning');
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

function getNickName(address) {
    return new Promise(function(resolve, reject) {
        var nickNameContract = web3.eth.contract(nickABI);
        var nicks = nickNameContract.at(contractAddress[currentNet]["nicks"]);
        nicks.nickOf(address, function(error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    })
}

function buy(data) {
    if (web3.currentProvider.isMetaMask === true && currentAccount && currentAccount.length > 0) {
        var itemTokenContract = web3.eth.contract(itemTokenABI);
        var ItemToken = itemTokenContract.at(contractAddress[currentNet]["itemToken"]);
        var nextPriceFormat = data.data('nextPrice');
        var nextPrice = web3.toWei(nextPriceFormat, 'ether');
        var itemID = data.data('itemID');
        var dimmer = $('[data-itemID=' + itemID + ']');
        dimmer.dimmer('setting', {
            closable: false,
            on: false
        });
        dimmer.dimmer('show');
        //Buy Item
        ItemToken.buy(itemID, { from: currentAccount, value: nextPrice }, function(error, txnHash) {
            if (!error) {
                if (txnHash) {
                    web3.eth.getTransactionReceiptMined(txnHash, 500).then(function(receipt) {
                        dimmer.modal('hide');
                        location.reload();
                    });
                } else {
                    //TO-DO  pop up error message
                    dimmer.modal('hide');
                    alert("Transaction Fail!!");
                }
            } else {
                dimmer.modal('hide');
                txnWarnModal.modal('show');
            }
        })
    }
}
var contractAddress = {
    "mainnet": {
        "nicks": "0x1C61D42EFAFe3c627998f2d53D897DBFD99d7fF9",
        "itemToken": "0x61D89828f79BbaEcf854c7dF08dca887aF0f8eE7"
    },
    "testnet": {
        "nicks": "0x1C61D42EFAFe3c627998f2d53D897DBFD99d7fF9",
        "itemToken": "0x61D89828f79BbaEcf854c7dF08dca887aF0f8eE7"
    },
    "ropsten": {
        "nicks": "0x1C61D42EFAFe3c627998f2d53D897DBFD99d7fF9",
        "itemToken": "0x7f2d6e933ab2013d32a68d27c5823dd36685702b"
    }
};

function priceOf(itemID) {
    return new Promise(function(resolve, reject) {
        var itemTokenContract = web3.eth.contract(itemTokenABI);
        var ItemToken = itemTokenContract.at(contractAddress[currentNet]["itemToken"]);
        ItemToken.priceOf(itemID, function(error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    })
}

function allOf(itemID) {
    return new Promise(function(resolve, reject) {
        var itemTokenContract = web3.eth.contract(itemTokenABI);
        var ItemToken = itemTokenContract.at(contractAddress[currentNet]["itemToken"]);
        ItemToken.allOf(itemID, function(error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    })
}

function ownerOf(itemID) {
    return new Promise(function(resolve, reject) {
        var itemTokenContract = web3.eth.contract(itemTokenABI);
        var ItemToken = itemTokenContract.at(contractAddress[currentNet]["itemToken"]);
        ItemToken.ownerOf(itemID, function(error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    })
}

function formatPrice(price) {

    doublePrice = parseFloat(web3.fromWei(price, 'ether').toString());

    return doublePrice.toFixed(5);;
}

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
                warning = '<div class="ui error message"><div class="header">Not Connected</div><div class="content">Your are using currently on a test network </div></div>';
                $(warning).insertAfter(".ui.huge.topbar.menu");

        }
        if (currentNet) {
            startApp();
        }
    })
}


function getNickNameUI() {
    var ethIcon = $('.app >.menu>.right>.item>.icon');
    var ethIconImage = ethIcon.find('.image');
    var nickNameItem = $('.app >.menu>.right>.item');
    var nickNameLabel = $('.app >.menu>.right>.item>.label');
    var bgColor = "#" + currentAccount.substr(currentAccount.length - 6);
    nickNameLabel.css('background-color', bgColor);
    getNickName(currentAccount).then(function(result) {
            isOnline = true;
            ethIcon.attr('data-tooltip', 'online').attr('data-position', 'bottom right');
            ethIconImage.attr('src', '/static/media/eth_online.svg');
            //enable set nickname
            nickNameLabel.popup({
                popup: $('.custom.popup'),
                position: 'bottom left',
                delay: {
                    show: 100,
                    hide: 1000
                }
            });

            if (result)
                nickNameLabel.html(result);
            else
                nickNameLabel.html(currentAccount.substr(currentAccount.length - 6));

        })
        .catch(function(error) {
            isOnline = false;
            ethIcon.attr('data-tooltip', 'offline').attr('data-position', 'bottom right');
            ethIconImage.attr('src', '/static/media/eth_offline.svg');
            nickNameLabel.html("");
        });

}




function setNickName(nickname) {
    var nickNameModalDimmer = nickNameModal.find('.dimmer');
    nickNameModalDimmer.dimmer('setting', {
        closable: false,
        on: false,
    });
    nickNameModalDimmer.dimmer('show');
    var nickNameContract = web3.eth.contract(nickABI);
    var nicks = nickNameContract.at(contractAddress[currentNet]["nicks"]);
    //  var nicknameSetEvent = nicks.Set({'_owner':web3.eth.defaultAccount}, {fromBlock: 0, toBlock: 'pending'});
    // console.log(nicknameSetEvent);
    nicks.set(nickname, function(error, txnHash) {
        if (!error) {
            if (txnHash) {
                web3.eth.getTransactionReceiptMined(txnHash, 500).then(function(receipt) {
                    //nickNameModal.find('.dimmer').dimmer('show');
                    //getNickNameUI();
                    //nickNameModal.modal('hide');
                    location.reload();
                });
            } else {
                nickNameModalDimmer.dimmer('hide');
                //nickNameModal.modal('hide');
                alert("Transaction is null");
            }
        } else {
            nickNameModalDimmer.dimmer('hide');
            //nickNameModal.modal('hide');
            txnWarnModal.modal('show');
            //alert(" Error: MetaMask Tx Signature: User denied transaction signature.");
        }
    });
}

function startApp() {
    initUI();
    var refreshAccount = function() {
        if (web3.eth.accounts[0] !== currentAccount) {
            web3.eth.defaultAccount = web3.eth.accounts[0];

            currentAccount = web3.eth.defaultAccount;
            if (!currentAccount || currentAccount.length === 0) {
                var warning = '<div class="ui error message appwarning"><div class="header">Not Connected</div><div class="content">Cryptohongkong requires a Web3 browser to use like MetaMask</div></div>';
                $(warning).insertAfter(".ui.huge.topbar.menu");


            } else {
                $('.ui.error.message.appwarning').remove();

            }
            getNickNameUI();
        }
    };
    refreshAccount();
    var accountInterval = setInterval(refreshAccount, 100);
    //adminOperaion();
}



function initMap() {
    function resize() {
        width = parseInt(d3.select("#viz").style("width")),
            width = width - margin.left - margin.right,
            height = width * mapRatio,
            projection.translate([width / 2, height / 2]).center(hongKongCenter).scale(width * [mapRatio + mapRatioAdjuster]),
            svg.style("width", width + "px").style("height", height + "px"),
            svg.selectAll("path").attr("d", path)
    }

    function zoomed() {
        features.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")")
    }



    var margin = {
            top: 10,
            left: 10,
            bottom: 10,
            right: 10
        },
        width = parseInt(d3.select("#viz").style("width")),
        width = width - margin.left - margin.right,
        mapRatio = 0.5,
        height = width * mapRatio,
        mapRatioAdjuster = 50;
    hongKongCenter = [114.15, 22.33];
    var projection = d3.geo.mercator().center(hongKongCenter).translate([width / 2, height / 2]).scale(width * [mapRatio + mapRatioAdjuster]);
    //var zoom = d3.behavior.zoom().translate([0, 0]).scale(1).scaleExtent([1, 20]).on("zoom", zoomed);

    d3.select(window).on("resize", resize);
    var svg = d3.select("#viz").append("svg").attr("width", width).attr("height", height),
        path = d3.geo.path().projection(projection),

        features = svg.append("g");
    d3.json("HKG_adm.json", function(t, e) {
        if (t) return console.error(t);
        topojson.feature(e, e.objects.HKG_adm1_1);
        features.selectAll("path")
            .data(topojson.feature(e, e.objects.HKG_adm1_1).features).enter()
            .append("path").attr("d", path)
            .attr("fill", "#e8d8c3"
                // function(t){
                //    var itemID = finditemIDByCode(t.properties.NAME_1);
                //    await ownerOf(itemID).then(function(result){
                //        var ownerAddress = result;
                //        return "#"+ownerAddress.substr(ownerAddress.length - 6);
                //    }).catch(function(error){
                //         return "#e8d8c3";
                //    })}
                //      function(t){
                //     var itemID = finditemIDByCode(t.properties.NAME_1);
                //     var color =   backgroundOf(itemID);
                //     return color;
                // }
            )
            .attr("stroke", "#404040")
            .attr("stroke-width", .2)
            .on("mouseover", async function(t) {
                d3.select("#tooltip").style("top", d3.event.pageY + 20 + "px")
                    .style("left", d3.event.pageX + 20 + "px")
                    .select("#region-name-tooltip")
                    .text(t.properties.NAME_1);
                var itemID = finditemIDByCode(t.properties.NAME_1);
                if (itemID) {
                    var currentPrice = await priceOf(itemID);
                    var currentPriceFormat = formatPrice(currentPrice);
                    d3.select("#tooltip").select("#region-price-tooltip")
                        .text(currentPriceFormat + ' ETH');
                } else {
                    d3.select("#tooltip").select("#region-price-tooltip")
                        .text('LOCK');
                }


                // d3.select("#region-name")
                //     .text(t.properties.NAME_1), d3.select("#region-type")
                //     .text(t.properties.ENGTYPE_1 + " (" + t.properties.TYPE_1 + ")");

                d3.select("#tooltip").classed("hidden", !1);
            })
            .on("mouseout", function() {
                d3.select("#tooltip").classed("hidden", !0);
            })
    });
}

function finditemIDByCode(districtName) {
    var result = 0;
    hk18districts.forEach(function(element) {
        if (element["code"] === districtName && !element["lock"])
            result = element["itemID"];
    });
    return result;
}



function initCards() {
    var cardsNode = $(".cards");
    var itemTokenContract = web3.eth.contract(itemTokenABI);
    var ItemToken = itemTokenContract.at(contractAddress[currentNet]["itemToken"]);
    for (var i = 0; i < hk18districts.length; i++) {
        if (hk18districts[i]['lock']) continue;
        (function(v) {
            var itemID = hk18districts[v]['itemID'];
            ItemToken.allOf(itemID, async function(error, result) {
                if (!error) {
                    var ownerAddress = result[0];
                    var bgColor = "#" + ownerAddress.substr(ownerAddress.length - 6);
                    var ownerName = "";
                    await getNickName(ownerAddress)
                        .then(function(result) {
                            if (result.length != 0)
                                ownerName = result;
                            else
                                ownerName = ownerAddress.substr(ownerAddress.length - 6);
                        })
                        .catch(function(error) {
                            ownerName = ownerAddress.substr(ownerAddress.length - 6);
                        });
                    var nextPrice = result[3];
                    var nextPriceFormat = formatPrice(nextPrice);
                    var districtName = hk18districts[v]['code'];
                    var imageURL = '/static/media/district/' + districtName.split(" ").join('_') + '_District_logo.svg';
                    var wikiURL = "https://en.wikipedia.org/wiki/" + districtName.split(" ").join('_') + '_District';
                    var transactionPending = $('<div class="ui dimmer"><div class="content"><div class="center"><div class="ui text loader">Transaction Pending</div></div></div><!--end content--></div>');
                    transactionPending.attr("data-itemID", itemID);
                    var cardNode = $('<div></div>').appendTo(cardsNode).addClass("ui card dimmable country-card");
                    cardNode.append(transactionPending);
                    var cardContent = $('<div></div>').addClass('content country-card-bg');
                    var districtImage = $('<img></img>').addClass('ui rounded left floated image')
                        .attr('src', imageURL).css("height", "40px");
                    var cardHeader = $('<div></div>').addClass('left aligned header').css("margin-top", "10px")
                        .html('<a href="' + wikiURL + '" target="_blank">' + districtName + '</a>');
                    var cardOwner = $('<div></div>').addClass('content country-card-owner')
                        .css("background-color", bgColor)
                        .css("color", "rgb(0, 0, 0)");
                    var owner = $('<span></span>').html("Owner: " + ownerName).css('font-size', '0.9em').css("letter-spacing", "1.5");
                    cardOwner.append(owner);
                    var buyButton = $('<div class="ui large left labeled button" role="button" tabindex="0"><a class="ui basic label">' +
                        nextPriceFormat + '</a><button class="ui primary button" role="button">Buy</button></div>');
                    buyButton.data("itemID", itemID);
                    buyButton.data("nextPrice", nextPriceFormat);
                    buyButton.click(function() {
                        buy($(this));
                    });
                    var extraContent = $('<div></div>').addClass('center aligned content')
                        .appendTo($('<div></div>').addClass('extra content'))
                        .append(buyButton);
                    cardContent.append(districtImage);
                    cardContent.append(cardHeader);
                    cardNode.append(cardContent);
                    cardNode.append(cardOwner);
                    cardNode.append(extraContent);
                } else {
                    console.error(error);
                }
            });
        })(i);
    }
    //add button function

}

function initUI() {
    //init maps
    initMap();
    //init cards
    initCards();
}