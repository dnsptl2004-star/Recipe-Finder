import mongoose from 'mongoose'

const RecipeSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String
})

export default mongoose.models.Recipe ||
  mongoose.model('Recipe', RecipeSchema)
