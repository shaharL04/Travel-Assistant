
class chatController{
    async newUserMessage(req,res){
        const {message} = req.body;
        console.log(message);
        res.json({message: "Message received"});
    }
}
export default new chatController();