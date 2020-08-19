var app = new Vue({
  el: '#app',
  data: {
    loading: true,
    contracts: {},
    web3Provider: undefined,
    account: null,
    lands: [],
    owners: [],
    isLoadingLands: true,
    isLoadingOwners: true,
    name: "",
    coordination: "",
    area: "",
    landmark: "",
    ownerName: "",
    nid: "",
    search: "",
    selectedLand: {},
    selectedOwner: 0
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
          id: owner[0],
          fullName: owner[1],
          nationalId: owner[2],
          numberOfLandsOwned: owner[3],
          ownerAddress: owner[4],
          ownedLandsIDs: owner[5],
        }
        let ownerLands= await this.landRegistry.showOwnerLands(owner[0])
        console.log(ownerLands)
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
    async addLandFromForm(name, coordination, area, landmark){
      this.$refs.closeAddLand.click()
      await this.addLand(this.name, this.coordination, this.area, this.landmark)
      this.name= ""
      this.coordination= ""
      this.area= ""
      this.landmark= ""
    },
    async addLand(name, coordination, area, landmark){
      this.isLoadingLands= true
      try{
        await this.landRegistry.addLandToSystem(name, coordination, area, landmark)
      }catch (e) {
        console.log(e)
      }
      await this.loadLands()
      this.isLoadingLands= false
    },
    async addOwnerFromForm(name, nid){
      this.$refs.closeAddOwner.click()
      await this.addOwner(this.ownerName, this.nid)
    },
    async addOwner(name, nid){
      this.isLoadingOwners= true
      try{
        await this.landRegistry.createOwner(name, nid)
      }catch (e) {
        console.log(e)
      }
      await this.loadOwners()
      this.isLoadingOwners= false
    },
    async addLandOwner(){
      console.log(this.selectedOwner)
      if(!this.selectedOwner){
        return;
      }
      this.$refs.closeLandOwner.click()
      if(parseInt(this.selectedLand.ownerAddress) == 0){
        await this.linkLandWithOwner(this.selectedLand.id, this.selectedOwner)
      }else{
        let originalOwner= this.owners.filter(owner => {
          return owner.ownerAddress == this.selectedLand.ownerAddress
        })
        console.log("original Owner: ", originalOwner)
        await this.transferLandToOwner(this.selectedLand.id, originalOwner[0].id, this.selectedOwner)
      }
      this.selectedOwner= ""
    },
    async linkLandWithOwner(land, owner){
      this.isLoadingLands= true
      this.isLoadingOwners= true
      try{
        await this.landRegistry.registerLand(land, owner)
      }catch (e) {
        console.log(e)
      }
      await this.loadLands()
      await this.loadOwners()
      this.isLoadingLands= false
      this.isLoadingOwners= false
    },
    async transferLandToOwner(land, originalOwner, owner){
      this.isLoadingLands= true
      this.isLoadingOwners= true
      try{
        await this.landRegistry.transferLand(land, originalOwner, owner)
      }catch (e) {
        console.log(e)
      }
      await this.loadLands()
      await this.loadOwners()
      this.isLoadingLands= false
      this.isLoadingOwners= false
    }


  },
  computed: {
    searchedLands(){
      console.log("filtering")
      if(this.search == ""){
        return this.lands
      } else{
        let lands= this.lands.filter(land => {
          return land.landName.toLocaleLowerCase().indexOf(this.search.toLocaleLowerCase()) != -1 || this.search == land.id
        })
        console.log(lands)
        return lands
      }
    }
  }
})
