import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req,res){
 
 try {
  const {user} = await getSession(req,res);
  const questionId = req.body;
  const client = await clientPromise;
  const db = client.db('EchoAI');
   await db.collection('chats').findOneAndDelete({
    _id: new ObjectId(questionId),
    userId:user.sub
  })
  res.status(200).json({
    message : 'Chat deleted successfully!'
  })
 } catch (error) {
  res.status(500).json({message:'could not delete'})
 }

}