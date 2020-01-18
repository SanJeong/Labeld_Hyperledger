#chaincode insall
docker exec cli peer chaincode install -n labeld -v 1.0 -p github.com/labeld
#chaincode instatiate
docker exec cli peer chaincode instantiate -n labeld -v 1.0 -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member")'
sleep 5

docker exec cli peer chaincode invoke -n labeld -C mychannel -c '{"Args":["addDataset","data1"]}'
sleep 5
docker exec cli peer chaincode query -n labeld -C mychannel -c '{"Args":["readDataset","data1"]}'
sleep 5
docker exec cli peer chaincode invoke -n labeld -C mychannel -c '{"Args":["addTask","data1","image1","user1","2020.01.01"]}'
sleep 5
docker exec cli peer chaincode query -n labeld -C mychannel -c '{"Args":["readDataset","data1"]}'

echo '-------------------------------------END-------------------------------------'
