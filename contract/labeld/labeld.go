package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type Dataset struct{
	DatasetID string `json:"datasetID"`
	Tasks []Task `json:"tasks"`
}
type Task struct{
	ImageID string  `json:"imageID"`
	UserID string  `json:"userID"`
	Date string`json:"date"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()

	if function == "addDataset" {
		return s.addDataset(APIstub, args)
	} else if function == "addTask" {
		return s.addTask(APIstub, args)
	} else if function == "readDataset" {
		return s.readDataset(APIstub, args)
	} 
	return shim.Error("Invalid Smart Contract function name.")
}
 
func (s *SmartContract) addDataset(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("fail!")
	}
	var data = Dataset{DatasetID: args[0]}
	dataAsBytes, _ := json.Marshal(data)
	APIstub.PutState(args[0], dataAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) addTask(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}
	// getState data
	dataAsBytes, err := APIstub.GetState(args[0])
	if err != nil{
		jsonResp := "\"Error\":\"Failed to get state for "+ args[0]+"\"}"
		return shim.Error(jsonResp)
	} else if dataAsBytes == nil{ // no State! error
		jsonResp := "\"Error\":\"Dataset does not exist: "+ args[0]+"\"}"
		return shim.Error(jsonResp)
	}
	// state ok
	data := Dataset{}
	err = json.Unmarshal(dataAsBytes, &data)
	if err != nil {
		return shim.Error(err.Error())
	}
	// create medi structure
	var Task = Task{ImageID: args[1], UserID: args[2], Date: args[3]}

	data.Tasks=append(data.Tasks,Task)
	
	// update to data World state
	dataAsBytes, err = json.Marshal(data);

	APIstub.PutState(args[0], dataAsBytes)

	return shim.Success([]byte("task is updated"))
}

func (s *SmartContract) readDataset(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	DataAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(DataAsBytes)
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}