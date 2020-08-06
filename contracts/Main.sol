pragma solidity >=0.4.21 <0.7.0;


contract Main {

    uint constant ARR_SIZE = 16;


    struct Land {
    string landName;
    string coordination; //30.0478224,31.4778987
    uint area;
    string landmark;
    uint id;

    address ownerAddress;
    }

    struct Owner {
    string fullName;
    string nationalId;
    uint numberOfLandsOwned;
    Land[ARR_SIZE] landsOwned; // array of IDs
    uint id;
    }


    //Max size of lands and owners available in our blockchain

    uint landCounter = 0;
    uint ownerCounter = 0;

    uint addLandFee = 0.1 ether;
    uint registryFee = 10 ether;

    //event for the front-end
    event NewRegistry(string landName, string coordination, uint area, string ownerName);

    Land[ARR_SIZE] public lands;
    Owner[ARR_SIZE] public owners;
    Land[ARR_SIZE] public landdsOwned;

/* 
    //fill owners to null
    function _fillOwnersArr() private {
        for(uint i = 0; i < ARR_SIZE, i++){
            owners[i] = Owner("NULL", "NULL ID"); // YNF3 A3ML CONSTRUCTOR MN 8ER MA AKTB KOL EL 7AGAT ??ظ
        }
    }
*/

    function _createOwner(string memory _fullName, string memory _NID) public {
        //owners[ownerCounter] = Owner(_fullName, _NID, 0, landsOwned, landCounter + 1);
        Owner memory ownr;
        ownr.fullName = _fullName;
        ownr.nationalId = _NID;
        ownr.numberOfLandsOwned = 0;
        ownr.landsOwned = landdsOwned;
        ownr.id = landCounter+1;
        landCounter++;
        //uint ID = owners.push(Owner(_fullName, _NID, landsOwned, 99));
        //owners[ID].id = ID;
        //7OT EVENT 
    }

    function addLandToSystem(string memory _landName, string memory _coordination, uint  _area, string memory _landmark) public payable {
        require(landCounter < 16);
        //require(msg.value == addLandFee);
        lands[landCounter] = Land(_landName, _coordination, _area, _landmark, landCounter + 1, address(0));
        landCounter++;
        
        //uint ID = lands.push(Land(_landName, _coordination, _area, _landmark, 99, address(0)));
        //lands[ID].id = ID;
        
    }

    //Land ID is the index of the land in the Lands[16] array
    mapping (uint => address) landToOwner;
    mapping (address => uint) ownerLands;


    function showLandById(uint _landId) public view returns(string memory){
        return lands[_landId].landName;
    }


    function registerLand(uint _landId, uint _ownerId) external payable {
        require(msg.value == registryFee);
        uint counter = owners[_ownerId].numberOfLandsOwned;
        lands[_landId].ownerAddress = msg.sender;
        owners[_ownerId].landsOwned[counter] = lands[_landId];
        owners[_ownerId].numberOfLandsOwned++;

    }

}


/** 
ERRORS:
require(msg.value == registryFee) => DOES NOT WORK IN TESTING, 
    ERR: Uncaught Error: Returned error: VM Exception while processing transaction: revert
**/