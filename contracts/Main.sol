pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2; // TO ALLOW RETURNING STRUCTS AND ARRAYS FROM FUNCTIONS


contract Main {

    // MAX SIZE OF LANDS AND OWNERS AVAILABLE IN OUR BLOCKCHAIN
    uint constant ARR_SIZE = 16;

    struct Land {
    string landName;
    string coordination; //30.049963, 31.262597 FOR EXAMPLE
    uint area;
    string landmark;
    uint id;
    address ownerAddress;
    }

    struct Owner {
    uint id;
    string fullName;
    string nationalId;
    uint numberOfLandsOwned;
    address ownerAddress;
    uint8[ARR_SIZE] ownedLandsIDs; // ARRAY OF IDs
    }

    // COUNTERS OF THE NUMBER OF LANDS AND OWNERS EXISTING IN THE SYSTEM (MAX: 16)
    uint public landCounter = 0;
    uint public ownerCounter = 0;

    // COSTS OF WRITING TO THE BLOCKCHAIN
    uint addLandFee = 1 ether;
    uint addOwnerFee = 1 ether;
    uint registryFee = 10 ether;

    // LAND ID IS THE INDEX OF THE LAND IN THE LANDS[16] ARRAY
    mapping (uint => address) landToOwner;
    mapping (address => uint) ownerLands;

    // EVENTS FOR THE FRONT END
    event NewOwner(string ownerName, string nationalId);
    event NewLand(string landName, string coordination, uint area, string landmark);
    event NewRegistry(string landName, string coordination, uint area, string ownerName);

    Land[ARR_SIZE] public lands;
    Owner[ARR_SIZE] public owners;
    uint8[ARR_SIZE] public landsOwnedIds;

    function createOwner(string calldata _fullName, string calldata _NID) external payable {

        // VEREFICATIONS FOR THE SIZE AND PAYMENT AMOUNT
        require(ownerCounter < 16);
//        require(msg.value == addOwnerFee);

        // ADDING THE NEW OWNER TO THE BLOCKCHAIN
        owners[ownerCounter] = Owner(ownerCounter+1, _fullName, _NID, 0, msg.sender, landsOwnedIds);
        ownerCounter++;

        // EVENT EMITTER FOR THE FRONT END
        emit NewOwner(_fullName, _NID);
    }

    function addLandToSystem(string calldata _landName, string calldata _coordination, uint _area, string calldata _landmark) external payable {

        // VEREFICATIONS FOR THE SIZE AND PAYMENT AMOUNT
        require(landCounter < 16);
//        require(msg.value == addLandFee);

        // ADDING THE NEW LAND TO THE BLOCKCHAIN
        lands[landCounter] = Land(_landName, _coordination, _area, _landmark, landCounter + 1, address(0));
        landCounter++;

        // EVENT EMITTER FOR THE FRONT END
        emit NewLand(_landName, _coordination, _area, _landmark);
    }

    function showLandById(uint _landId) public view returns(Land memory){
        return lands[_landId-1];
    }

    function showOwnerById(uint _ownerId) public view returns(Owner memory){
        return owners[_ownerId-1];
    }

    function showOwnerLands(uint _ownerId) public view returns(uint8[ARR_SIZE] memory){
        uint8[ARR_SIZE] memory landIds = owners[_ownerId-1].ownedLandsIDs;
        return landIds;
    }

    // REGISTER A LAND AND ASSOCIATE IT TO AN EXISTING OWNER
    function registerLand(uint _landId, uint _ownerId) external payable {

        //CHECK IF THE LAND DOES NOT BELONG TO SOMEONE ELSE && CHECK IF THE OWNER ID AND THE LAND ID BOTH EXIST IN THE SYSTEM
        if ( (lands[_landId].ownerAddress == address(0)) && (_landId <= landCounter) && (_ownerId <= ownerCounter) ){

//            require(msg.value == registryFee);
            uint counter = owners[_ownerId-1].numberOfLandsOwned;
            lands[_landId-1].ownerAddress =  owners[_ownerId-1].ownerAddress;
            owners[_ownerId-1].ownedLandsIDs[counter] = uint8(_landId);
            owners[_ownerId-1].numberOfLandsOwned++;

            // EVENT EMITTER FOR THE FRONT END
            emit NewRegistry(lands[_landId].landName, lands[_landId].coordination, lands[_landId].area, owners[_ownerId].fullName);
        }
    }

    // TRANSFER LAND REGISTRY FROM AN EXISTING OWNER TO ANOTHER ONE
    function transferLand(uint _landId, uint _originalOwnerId, uint _newOwnerId) external payable {

        // CHECK IF THE ORIGINAL OWNER DOES INDEED HAVE THE LAND REGISTERED TO HIS/HER ADDRESS
        if (lands[_landId-1].ownerAddress == owners[_originalOwnerId-1].ownerAddress) {
//            require(msg.value == registryFee);

            // REMOVE ORIGINAL OWNER ASSOCIATION WITH THE LAND
            for (uint i = 0; i < ARR_SIZE; i++){
                if(owners[_originalOwnerId-1].ownedLandsIDs[i] == _landId){
                    owners[_originalOwnerId-1].ownedLandsIDs[i] = 0;
                    break;
                }
            }
            owners[_originalOwnerId-1].numberOfLandsOwned--;

            // ASSOCIATE THE LAND WITH THE NEW OWNER
            lands[_landId-1].ownerAddress = owners[_newOwnerId-1].ownerAddress;
            owners[_newOwnerId-1].numberOfLandsOwned++;
            owners[_newOwnerId-1].ownedLandsIDs[ owners[_newOwnerId-1].numberOfLandsOwned ] = uint8(_landId);

            // EVENT EMITTER FOR THE FRONT END
            emit NewRegistry(lands[_landId].landName, lands[_landId].coordination, lands[_landId].area, owners[_newOwnerId].fullName);
        }
    }

}
