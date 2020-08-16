var app = new Vue({
  el: '#content',
  data: {
    loading: true,
    contracts: {},
    web3Provider: undefined,
    account: null,
    lands: [],
    owners: [],
    isLoadingLands: true,
    isLoadingOwners: true,
  },
  async mounted(){
    await this.loadWeb3()
    await this.loadAccount()
    await this.loadContract()
    await this.render()
  },
  methods: {
    async loadWeb3() {
      if (typeof web3 !== 'undefined') {
        this.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        this.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },

    loadAccount() {
      // Set the current blockchain account
      this.account = web3.eth.accounts[0]
    },

    async loadContract() {
      // Create a JavaScript version of the smart contract
      let landRegistry = await fetch('Main.json')
      landRegistry= await landRegistry.json()
      console.log(landRegistry)
      this.contracts.landRegistry = TruffleContract(landRegistry)
      this.contracts.landRegistry.setProvider(this.web3Provider)

      // Hydrate the smart contract with values from the blockchain
      this.landRegistry = await this.contracts.landRegistry.deployed()
      console.log(this.landRegistry)
    },

    async render() {
      // Update app loading state
      this.loading= true

      // Render Tasks
      await this.loadLandsAndOwners()

      this.loading= false
    },
    async loadLandsAndOwners(){
      await this.loadOwners()
      await this.loadLands()
    },
    async loadOwners(){
      this.isLoadingOwners= true
      this.owners= []
      // Load the total task count from the blockchain
      let ownerCounter = await this.landRegistry.ownerCounter()
      // console.log(ownerCounter)
      // console.log(ownerCounter.c[0])

      // Render out each task with a new task template
      for (var i = 0; i < ownerCounter; i++) {
        // Fetch the task data from the blockchain
        const owner = await this.landRegistry.owners(i)
        console.log(owner)
        let newOwner= {
          fullName: owner[0],
          nationalId: owner[1],
          numberOfLandsOwned: owner[2],
          ownedLandsIDs: owner[3],
          ownerAddress: owner[4],
          id: owner[5],
        }
        this.owners.push(newOwner)
      }
      this.isLoadingOwners= false
    },
    async loadLands() {
      this.isLoadingLands= true
      this.lands= []
      // Load the total task count from the blockchain
      // await this.addLand("Land1", "30.049963, 31.262597", 20, "landmark1")
      let landCounter = await this.landRegistry.landCounter()
      // console.log(landCounter)
      // console.log(landCounter.c[0])

      // Render out each task with a new task template
      for (var i = 0; i < landCounter; i++) {
        // Fetch the task data from the blockchain
        const land = await this.landRegistry.lands(i)
        // console.log(land)
        let newLand= {
          landName: land[0],
          coordination: land[1],
          area: land[2],
          landmark: land[3],
          id: land[4],
          ownerAddress: land[5],
        }
        this.lands.push(newLand)
      }
      this.isLoadingLands= false
    },
    async addLand(name, coordination, area, landmark){
      this.isLoadingLands= true
      try{
        await this.landRegistry.addLandToSystem(name, coordination, area, landmark)
      }catch (e) {
      }
      await this.loadLands()
      this.isLoadingLands= false
    },
    async addOwner(name, nid){
      this.isLoadingOwners= true
      try{
        await this.landRegistry.createOwner(name, nid)
      }catch (e) {
      }
      await this.loadOwners()
      this.isLoadingOwners= false
    }

  }
})
