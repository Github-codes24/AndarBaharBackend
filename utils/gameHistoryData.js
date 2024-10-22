const { GameHistory } = require("../models/gameHistory.model");

const gameHistoryData=async(winValue,historyArray)=>{
    let GameHistoryData= await GameHistory.findOne({historyArray:{ $ne: [] }})
    if(!GameHistoryData){
     GameHistoryData = new GameHistory({
        historyArray:[]
     });
    }
    
    GameHistoryData[historyArray].push(winValue)
    GameHistoryData.save()
}

module.exports={gameHistoryData}