const mongoose = require('mongoose');
require('dotenv').config();

const Recipe = require('./models/Recipe');

mongoose.connect(process.env.MONGO_URI, {
  dbName: 'recipesDB'
}).then(async () => {
  const updates = [
    {
      title: "tea",
      image: "https://tse4.mm.bing.net/th/id/OIP.fBMndpZ25dhaENGy8GoBdAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3"
    },
    {
      title: "cookies",
      image: "https://thecafesucrefarine.com/wp-content/uploads/One-Bowl-Toffee-Bar-Chocolate-Chip-Cookies-1-2.jpg"
    },
    {
      title: "pizza",
      image: "https://tse4.mm.bing.net/th/id/OIP.SEfXqwWqK1NNMpH9ZmNrgwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3"
    },
    {
      title: "french fries",
      image: "https://images.slurrp.com/prod/articles/35vs18mcfqn.webp"
    },
    {
      title: "ladoo",
      image: "https://thumbs.dreamstime.com/z/diwali-sweets-ladoo-17571438.jpg"
    },
    {
      title: "dal bhat",
      image: "https://i.pinimg.com/originals/f8/12/f9/f812f9d133e3f5b3ea792dec6caf8ca3.jpg"
    },
    {
      title: "fulvadi",
      image: "https://ruchisvegkitchen.files.wordpress.com/2021/04/20210409171555_img_5642_wm_wm.jpg?w=640"
    },
    {
      title: "dal dhokli",
      image: "https://i0.wp.com/www.cookingfromheart.com/wp-content/uploads/2017/04/Dal-Dhokli-6.jpg?resize=600%2C400"
    },
    {
      title: "gujarati thali",
      image: "https://hungerfoody.files.wordpress.com/2018/12/gujarati-thali.jpg"
    }
  ];

  for (const item of updates) {
    const result = await Recipe.updateOne(
      { title: item.title },
      { $set: { image: item.image } },
      { upsert: true }
    );
    console.log(`✅ Updated ${item.title}:`, result.modifiedCount > 0 ? 'Modified' : result.upsertedCount ? 'Inserted' : 'No change');
  }

  mongoose.disconnect();
}).catch(err => {
  console.error('❌ Error updating:', err);
});
