var nickABI = [
	{
		"constant": true,
		"inputs": [
			{
				"name": "_nick",
				"type": "string"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"name": "_owner",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "nickOf",
		"outputs": [
			{
				"name": "_nick",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_nick",
				"type": "string"
			},
			{
				"indexed": true,
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "Set",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_nick",
				"type": "string"
			},
			{
				"indexed": true,
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "Unset",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_nick",
				"type": "string"
			}
		],
		"name": "set",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "unset",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	}
];
