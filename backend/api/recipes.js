export default async function handler(req,res){
 res.status(200).json([
  {id:1,title:"Recipe 1"},
  {id:2,title:"Recipe 2"}
 ]);
}
