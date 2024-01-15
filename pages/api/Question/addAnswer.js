import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req,res){
 
 try {
  const {user} = await getSession(req,res);
  const{chatId,type,content} = req.body;
  const client = await clientPromise;
  const db = client.db('EchoAI');
  const chat = await db.collection('chats').findOneAndUpdate({
    _id: new ObjectId(chatId),
    userId:user.sub
  },{
    $push:{
      questions:{
        type,
        content
      }
    }
  },{
    returnDocument:'after'
  })
  res.status(200).json({
    chat:{
      ...chat.value,
      _id:chat.value._id.toString()
    }
  })
 } catch (error) {
  res.status(500).json({message:'something went wrong'})
 }

}