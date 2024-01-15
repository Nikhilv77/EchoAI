import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";

export default async function handler(req,res){
 try {
  const {user} = await getSession(req,res);
const userQuestion = JSON.parse(req.body);
 
  const newQuestion =   {
    type:'question',
    content:userQuestion
  }
  const client = await clientPromise;
  const db = client.db('EchoAI');
  const chat = await db.collection('chats').insertOne({
    userId:user.sub,
    questions : [newQuestion],
    title : userQuestion
  })
  res.status(200).json({
    _id:chat.insertedId.toString(),
    questions:[newQuestion],
    title:userQuestion
  });
 } catch (error) {
  console.log(error);
  res.status(500).json({message:'something went wrong!'})
 }
}