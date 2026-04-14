import mongoose from 'mongoose';
import Recipe from './models/Recipe.js';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URI, { dbName: 'recipesDB' })
  .then(async () => {
    console.log("✅ MongoDB સાથે કનેક્શન સફળ થયું");
    
    const recipes = [
  {
    title: "tea",
    serves: "2 લોકો માટે",
    cuisine: "ભારતીય",
    time: "10 મિનિટ",
    difficulty: "સુલભ",
    image: "https://tse4.mm.bing.net/th/id/OIP.fBMndpZ25dhaENGy8GoBdAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3",
    ingredients: [
      "1 કપ પાણી",
      "1 ચમચી ચાની પત્તી",
      "2 ચમચી ખાંડ",
      "1/2 કપ દૂધ"
    ],
    instructions:
      "પાણી ઉકાળો. તેમાં ચાની પત્તી નાખો. ખાંડ અને દૂધ ઉમેરી ઉકાળો. પછી ગાળી અને ગરમ પીવો.",
    video: "https://youtu.be/sC124g6CSn8?si=Zq2Hz8w5rIcoLq1t"
  },

  {
    title: "cookies",
    serves: "4 લોકો માટે",
    image:
      "https://thecafesucrefarine.com/wp-content/uploads/One-Bowl-Toffee-Bar-Chocolate-Chip-Cookies-1-2.jpg",
    ingredients: [
      "1 કપ માખણ",
      "1 કપ सफેદ ખાંડ",
      "1 કપ બ્રાઉન શુગર",
      "2 ઈંડા",
      "2 ચમચી વેનિલા એસેન્સ",
      "3 કપ માદો",
      "1 ચમચી બેકિંગ સોડા",
      "2 ચમચી ગરમ પાણી",
      "અડધી ચમચી મીઠું",
      "2 કપ ચોકલેટ ચિપ્સ"
    ],
    instructions:
      "ઓવનને 175°C સુધી ગરમ કરો. માખણ અને શુગર ફેટો. ઈંડા અને વેનિલા ઉમેરો. બેકિંગ સોડા ગરમ પાણીમાં ઉકાળી ઉમેરો. માદો અને ચોકલેટ ચિપ્સ મિક્સ કરો. થાળીમાં રાખો અને 10 મિનિટ બેક કરો.",
    video: "https://youtu.be/fEl7_ti9_pQ?si=cI_ZprOH9NGPqyFU"
  },

  {
    title: "pizza",
    serves: "2 લોકો માટે",
    image:
      "https://tse4.mm.bing.net/th/id/OIP.SEfXqwWqK1NNMpH9ZmNrgwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
    ingredients: [
      "1 પિઝા ડો (મધ્યમ સાઇઝ)",
      "1/2 કપ ટોમેટો સોસ",
      "1 કપ મોઝારેલા ચીઝ",
      "1 કપ ટોપિંગ્સ (કેપ્સિકમ, ઓલિવ, કોર્ન વગેરે)"
    ],
    instructions:
      "ઓવનને 220°C પર ગરમ કરો. પિઝા ડો પર સોસ લગાવો. ચીઝ અને ટોપિંગ્સ ઉમેરો. 12–15 મિનિટ સુધી બેક કરો.",
    video:
      "https://youtu.be/VqyWYpJHnH0?si=wNuUy2DYehCOmYUG"
  },

  {
    title: "french fries",
    serves: "2 લોકો માટે",
    image: "https://images.slurrp.com/prod/articles/35vs18mcfqn.webp",
    ingredients: [
      "3 મોટા બટાટા",
      "1 ચમચી મીઠું",
      "તળવા માટે તેલ (જરૂર પ્રમાણે)"
    ],
    instructions:
      "બટાટાં છોલો, લાંબા કાપો. પલાળો. ગરમ તેલમાં સુવર્ણ તળી લો. મીઠું છાંટો અને પીરસો.",
    video:
      "https://youtu.be/VqyWYpJHnH0?si=wNuUy2DYehCOmYUG"
  },

     {
  title: "ladoo",
  serves: "6 લોકો માટે",
  image: "https://thumbs.dreamstime.com/z/diwali-sweets-ladoo-17571438.jpg",
  ingredients: [
    "2 કપ બેસન",
    "1 કપ ઘી",
    "1 કપ ખાંડ",
    "1 ચમચી એલચી પાઉડર",
    "1/2 કપ સૂકા મેવાં"
  ],
  instructions:
    "ઘીમાં બેસન ભૂંજી લો જ્યાં સુધી સુગંધ ન આવે. ખાંડ અને એલચી ઉમેરો. લાડુ બનાવો અને ઉપર મેવાં લગાવો.",
  video: "https://youtu.be/u50h9LRhVB4?si=IL1eLDQbvFrkP7qG"
},
{
  title: "dal bhat",
  serves: "3 લોકો માટે",
  image:
    "https://i.pinimg.com/originals/f8/12/f9/f812f9d133e3f5b3ea792dec6caf8ca3.jpg",
  ingredients: [
    "1 કપ ચોખા",
    "1/2 કપ તૂર દાળ",
    "1 ચમચી મીઠું",
    "1/2 ચમચી હળદર",
    "1 ચમચી ઘી",
    "1 ચમચી જીરું"
  ],
  instructions:
    "દાળમાં હળદર-મીઠું નાખી ઉકાળો. ચોખા અલગ ઉકાળો. ઘીમાં જીરું તળીને દાળમાં વઘાર કરો.",
  video: "https://youtu.be/GZPiV6xzMqc?si=ySVtfonu0nn_qaSl"
},
{
  title: "fulvadi",
  serves: "5 લોકોને માટે",
  image:
    "https://ruchisvegkitchen.files.wordpress.com/2021/04/20210409171555_img_5642_wm_wm.jpg?w=640",
  ingredients: [
    "2 કપ બેસન",
    "2 ચમચી તલ",
    "1 ચમચી આદુ-મરચાની પેસ્ટ",
    "1 ચમચી અજમો",
    "1/2 ચમચી હળદર",
    "1 ચમચી લાલ મરચું",
    "1 ચમચી મીઠું",
    "2 ચમચી તેલ",
    "1/2 કપ પાણી",
    "તળવા માટે તેલ"
  ],
  instructions:
    "બધું ભેળવી લોટ બાંધો. રોલ બનાવી સ્ટીમ કરો. કાપીને તળી લો."
},
{
  title: "dal dhokli",
  serves: "3 લોકો માટે",
  image:
    "https://i0.wp.com/www.cookingfromheart.com/wp-content/uploads/2017/04/Dal-Dhokli-6.jpg?resize=600%2C400",
  ingredients: [
    "1 કપ દાળ",
    "1 ચમચી ઘી",
    "1 ચમચી જીરું",
    "1/2 ચમચી હળદર",
    "2 ચમચી કોથમરું",
    "1 કપ ઘઉંનો લોટ",
    "1 ચમચી મીઠું",
    "1 ચમચી મસાલા",
    "1/4 ચમચી હિંગ",
    "1 લીંબુ"
  ],
  instructions:
    "દાળ ઉકાળો. લોટથી ધોકળી બનાવો અને દાળમાં ઉકાળો. વઘાર કરો.",
  video: "https://youtu.be/ro8pCoI6Xc8?si=e1Fl6JZ7rjQ5shmq"
},
{
  title: "gujarati thali",
  serves: "1 વ્યક્તિ માટે",
  image: "https://hungerfoody.files.wordpress.com/2018/12/gujarati-thali.jpg",
  ingredients: [
    "2 રોટલી",
    "1 બટાટાનું શાક",
    "1 બાઉલ દાળ",
    "1 બાઉલ ભાત",
    "1 ગ્લાસ છાશ",
    "1 બાઉલ મીઠો",
    "1 બાઉલ લોટ",
    "1 બાઉલ ફરસાણ"
  ],
  instructions:
    "બધા વ્યંજન બનાવી પ્લેટમાં ગોઠવો અને થાળી પીરસો.",
  video: "https://youtu.be/8RhDZ3jk2Vg?si=MRYBxYHByJE2fSHP"
},
{
  title: "Khandvi",
  serves: "2 લોકો માટે",
  image:
    "https://www.vegrecipesofindia.com/wp-content/uploads/2021/09/khandvi-recipe-1.jpg",
  ingredients: [
    "1 કપ બેસન",
    "2 કપ છાશ",
    "1/2 ચમચી હળદર",
    "1 ચમચી મીઠું",
    "1 ચમચી તેલ",
    "1 ચમચી રાય",
    "1 ચમચી સેસમ",
    "2 ચમચી કોથમરું"
  ],
  instructions:
    "બેસન-છાશ ભેળવી રાંધી લો. પાતળી ફેલાવો અને રોલ બનાવો. વઘાર કરો.",
  video: "https://youtu.be/dtvRMihki6g?si=KQ-6cek6aKDOvS-J"
},
{
  title: "Dhokla",
  serves: "4 લોકો માટે",
  image:
    "https://www.vegrecipesofindia.com/wp-content/uploads/2021/11/khaman-dhokla-1.jpg",
  ingredients: [
    "2 કપ બેસન",
    "1 પેકેટ ઈનો",
    "1/2 ચમચી હળદર",
    "1 ચમચી મીઠું",
    "1 ચમચી લીંબુ",
    "1/4 ચમચી હિંગ",
    "1 ચમચી રાય",
    "કરિ પત્તા"
  ],
  instructions: "બેસન ભેળવી સ્ટીમ કરો. ઉપરથી વઘાર કરો.",
  video: "https://youtu.be/cSs77CQh3FI?si=EiMqEVSLn8WxdGC1"
},
{
  title: "Thepla",
  serves: "3 લોકો માટે",
  image:
    "https://www.vegrecipesofindia.com/wp-content/uploads/2021/04/methi-thepla-recipe-1.jpg",
  ingredients: [
    "2 કપ ઘઉંનો લોટ",
    "1 કપ મેથી",
    "1/2 ચમચી હળદર",
    "1 ચમચી મીઠું",
    "2 ચમચી તેલ",
    "1 ચમચી મસાલા",
    "2 ચમચી દહીં"
  ],
  instructions:
    "બધું ભેળવી લોટ બાંધો. થેપલા શેકો.",
  video: "https://youtu.be/A2C9CY8ZymQ?si=p6VOozOxAatZ2VbW"
},
{
  title: "Handvo",
  serves: "4 લોકો માટે",
  image:
    "https://www.vegrecipesofindia.com/wp-content/uploads/2021/01/handvo-recipe-1.jpg",
  ingredients: [
    "2 કપ હેન્ડવો લોટ",
    "1 કપ દહીં",
    "1/2 ચમચી હળદર",
    "1 ચમચી મીઠું",
    "1/4 ચમચી સોડા",
    "1 ચમચી રાય",
    "1 ચમચી સેસમ",
    "કરિ પત્તા"
  ],
  instructions:
    "લોટ ભેળવો, ફર્મેન્ટ કરો અને બેક કરો."
},
{
  title: "Undhiyu",
  serves: "5 લોકો માટે",
  image:
    "https://www.vegrecipesofindia.com/wp-content/uploads/2020/12/undhiyu-recipe-1.jpg",
  ingredients: [
    "3컵 મિક્સ શાકભાજી",
    "2 ચમચી મસાલા",
    "1 ચમચી મીઠું",
    "2 ચમચી તેલ",
    "1 કપ મેથી મઠિયા",
    "1/2 ચમચી હળદર"
  ],
  instructions:
    "શાક ભેળવી મસાલા સાથે ધીમી આંચે રાંધો."
},
{
  title: "Muthiya",
  serves: "3 લોકો માટે",
  image:
    "https://www.vegrecipesofindia.com/wp-content/uploads/2021/08/methi-muthiya-recipe-1.jpg",
  ingredients: [
    "1 કપ મેથી",
    "1.5 કપ ઘઉંનો લોટ",
    "1 ચમચી મસાલા",
    "1 ચમચી મીઠું",
    "2 ચમચી તેલ",
    "1/2 ચમચી હળદર"
  ],
  instructions:
    "લોટ બાંધી મુઠીયા સ્ટીમ કરો અને વઘાર કરો."
},
{
  title: "Sev Tameta",
  serves: "2 લોકો માટે",
  image:
    "https://www.vegrecipesofindia.com/wp-content/uploads/2022/01/sev-tameta-nu-shaak-1.jpg",
  ingredients: [
    "3 ટામેટાં",
    "1 કપ સેવ",
    "1 ચમચી મસાલા",
    "1/2 ચમચી હળદર",
    "1 ચમચી મીઠું",
    "2 ચમચી તેલ"
  ],
  instructions: "ટામેટાં રાંધો, સેવ ઉમેરો અને પીરસો."
},
{
  title: "Khichu",
  serves: "2 લોકો માટે",
  image:
    "https://www.vegrecipesofindia.com/wp-content/uploads/2021/06/khichu-recipe-1.jpg",
  ingredients: [
    "1 કપ ચોખાનો લોટ",
    "1/4 ચમચી હિંગ",
    "1 ચમચી મીઠું",
    "1 ચમચી જીરું",
    "2 કપ પાણી",
    "1 ચમચી મસાલા"
  ],
  instructions:
    "પાણી ઉકાળો, લોટ નાખી હલાવો, પીરસો."
},

  {
    title: "Gujarati Kadhi",
    serves: "3 લોકો માટે",
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/10/gujarati-kadhi-recipe-1.jpg",
    ingredients: [
      "દહીં", "બેસન", "મીઠું", "હળદર", "તેલ", "રાય", "હિંગ", "કરિ પત્તા"
    ],
    instructions: "બેસન અને દહીં ભેળવો. રાંધો અને ઉપરથી વઘાર કરો."
  },
  {
    title: "Ringan no Olo",
    serves: "3 લોકો માટે",
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/01/baingan-bharta.jpg",
    ingredients: [
      "વીંગણ", "લસણ", "મીઠું", "મીઠો વઘાર", "કોથમરું",
      "હળદર", "મરચું", "હિંગ"
    ],
    instructions: "વીંગણ ભૂસો અને છાલ દૂર કરો. વઘાર કરો અને બાકીની સામગ્રી સાથે મિક્સ કરો."
  },
  {
    title: "Bhindi Masala",
    serves: "3 લોકો માટે",
    image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/06/bhindi-masala.jpg",
    ingredients: [
      "ભીંડા", "મીઠું", "હળદર", "મીઠો વઘાર", "ધાણા જીરું",
      "લાલ મરચું", "હિંગ", "તેલ"
    ],
    instructions: "ભીંડાને સાફ કરીને કાપો. વઘારમાં પકાવો અને મસાલા ઉમેરો. નરમ થાય ત્યાં સુધી રાંધો."
  },
  {
    title: "Batata Nu Shaak",
    serves: "3 લોકો માટે",
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/09/batata-nu-shaak-1.jpg",
    ingredients: [
      "બટાકા", "મીઠું", "હળદર", "મીઠો વઘાર", "મીઠું",
      "કાંદા", "લીંબુનો રસ", "કોથમરું", "મરચું"
    ],
    instructions: "બટાકા કાપીને વઘારમાં પકાવો. મસાલા ઉમેરી નરમ થાય ત્યાં સુધી રાંધો. કોથમરું છાંટીને પીરસો."
  },
  {
    title: "Tuver na Thotha",
    serves: "4 લોકો માટે",
    image: "https://i.ytimg.com/vi/R6tysp74WRA/maxresdefault.jpg",
    ingredients: [
      "તુવેર", "મીઠું", "હળદર", "લસણ", "મીઠો વઘાર",
      "કાંદા", "કોથમરું", "હિંગ", "તેલ", "મરચું"
    ],
    instructions: "તુવેર રાંધીને વઘારમાં મસાલા ઉમેરો. પાણી ઉમેરો અને ઉકાળો. કોથમરું છાંટીને પીરસો."
  },
  {
    title: "Karela Batata nu Shaak",
    serves: "3 લોકો માટે",
    image: "https://www.spiceupthecurry.com/wp-content/uploads/2021/07/karela-batata-1.jpg",
    ingredients: [
      "કરેલા", "બટાકા", "હળદર", "મીઠું", "મીઠો વઘાર",
      "તેલ", "ધાણા જીરું", "લીંબુ", "મીઠો"
    ],
    instructions: "કરેલા તળો. બટાકા સાથે મસાલા ભેળવો અને શાક બનાવો. લીંબુ છાંટીને પીરસો."
  },
  {
    title: "Lauki Thepla",
    serves: "4 લોકો માટે",
    image: "https://www.spiceupthecurry.com/wp-content/uploads/2020/11/bottle-gourd-thepla-1.jpg",
    ingredients: [
      "દૂધી", "ઘઉંનો લોટ", "મીઠું", "દહીં", "હળદર",
      "મરચું", "તેલ", "તલ", "જીરું"
    ],
    instructions: "દૂધી ઘસી લો. લોટ સાથે મિક્સ કરો. થેપલા બેલીને તવા પર શેકો."
  },
  {
    title: "Mag Ni Dal",
    serves: "3 લોકો માટે",
    image: "https://www.archanaskitchen.com/images/archanaskitchen/1-Author/Pooja_Thakkar/Mag_Ni_Dal_Gujarati_Style_Yellow_Moong_Dal_Recipe-1.jpg",
    ingredients: [
      "મગ દાળ", "હળદર", "મીઠું", "મીઠો વઘાર", "લસણ",
      "કોથમરું", "હિંગ", "મરચું"
    ],
    instructions: "દાળ ઉકાળી વઘાર કરો. મસાલા ઉમેરી ઉકાળો. કોથમરું છાંટીને પીરસો."
  },
  {
    title: "Turiya Patra nu Shaak",
    serves: "3 લોકો માટે",
    image: "https://i.ytimg.com/vi/JSzN8TztnwU/maxresdefault.jpg",
    ingredients: [
      "તુરીયા", "પાત્રા", "હળદર", "મીઠું", "મીઠો વઘાર",
      "તેલ", "લસણ", "કોથમરું"
    ],
    instructions: "તુરીયા કાપો અને પાત્રા સાથે વઘારમાં ભેળવો. શાક તૈયાર કરો."
  },
  {
    title: "Bharela Bhinda",
    serves: "3 લોકો માટે",
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/02/bharwa-bhindi-1.jpg",
    ingredients: [
      "ભીંડા", "મસાલા મિશ્રણ", "તેલ", "હળદર", "મીઠું",
      "ધાણા જીરું", "હિંગ"
    ],
    instructions: "ભીંડામાં મસાલા ભરો. પેનમાં ધીમી આંચ પર શેકો. નરમ થાય ત્યાં સુધી રાંધો."
  },
  {
    title: "Lilva Kachori",
    serves: "4 લોકો માટે",
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2019/10/lilva-kachori-recipe-1.jpg",
    ingredients: [
      "લીલવા દાણા", "અદુ-મરચાં", "ઘઉંનો લોટ", "હળદર", "મીઠું",
      "તેલ", "હિંગ", "મીઠો વઘાર"
    ],
    instructions: "લીલવાના મસાલા ભરી કચોરી બનાવો. તેલમાં તળી લો."
  },
  {
    title: "Kopra Pak",
    serves: "10 પીસ માટે",
    image: "https://www.cookingwithsiddhi.com/wp-content/uploads/2020/08/coconut-barfi-kopra-pak.jpg",
    ingredients: [
      "સુકો નાળિયેર", "ખાંડ", "દૂધ", "એલચી", "ઘી"
    ],
    instructions: "નાળિયેર અને ખાંડ ઉકાળો. ઘી અને એલચી ઉમેરો. ગ્રીસ કરેલી થાળીમાં પાથરો. કાપીને ઠંડુ થવા દો."
  },
  {
    title: "Moong Dal Dhokla",
    serves: "4 લોકો માટે",
    image: "https://hebbarskitchen.com/wp-content/uploads/2020/10/moong-dal-dhokla-recipe-moong-dal-khaman-3-500x500.jpeg",
    ingredients: [
      "મગ દાળ", "હળદર", "મીઠું", "હિંગ", "મીઠો વઘાર",
      "તલ", "કાંદા", "ઈનો", "કોથમરું"
    ],
    instructions: "મગદાળ પીસીને બેટર બનાવો. ઈનો ઉમેરો. વરાળમાં બાફો અને ઉપરથી વઘાર કરો."
  },
  {
    title: "Handvo",
    serves: "4 લોકો માટે",
    image: "https://www.cookwithmanali.com/wp-content/uploads/2020/08/Handvo-500x500.jpg",
    ingredients: [
      "હાંડવો મિક્સ", "દહીં", "ઈનો", "હળદર", "મીઠું",
      "તેલ", "તલ", "રાય", "કડીપત્તા", "હિંગ"
    ],
    instructions: "હાંડવો મિક્સમાં દહીં અને ઈનો ભેળવો. વઘાર સાથે બેક કરો અથવા તવા પર શેકો."
  },
  {
    title: "Sev Tameta nu Shaak",
    serves: "3 લોકો માટે",
    image: "https://www.archanaskitchen.com/images/archanaskitchen/1-Author/pooja_thakkar/Sev_Tameta_nu_Shaak_Gujarati_Style_Tomato_Curry_with_Sev.jpg",
    ingredients: [
      "ટમેટાં", "સેવ", "હળદર", "મીઠું", "મીઠો વઘાર",
      "મીઠો", "જીરું", "હિંગ", "તેલ", "લીંબુ"
    ],
    instructions: "ટમેટાં રાંધી વઘાર કરો. મસાલા ઉમેરી સેવ છાંટો અને પીરસો."
  },
  {
    title: "Muthiya",
    serves: "4 લોકો માટે",
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2019/06/methi-muthia-recipe-1.jpg",
    ingredients: [
      "મેથી", "ઘઉંનો લોટ", "મકાઈ લોટ", "હળદર", "મીઠું",
      "હિંગ", "તેલ", "તલ", "મીઠો વઘાર"
    ],
    instructions: "મેથી અને લોટ ભેળવી મુઠિયા બનાવો. વરાળમાં બાફી વઘાર કરો."
  },
  {
    title: "Undhiyu",
    serves: "5 લોકો માટે",
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/11/undhiyu-1.jpg",
    ingredients: [
      "શાકભાજી મિક્સ", "મસાલા મિશ્રણ", "મીઠું", "તેલ", "લીલવા",
      "મેથી ના મુઠિયા", "હળદર", "હિંગ"
    ],
    instructions: "શાકભાજી અને મસાલા ભેળવો. ધીમી આંચે રાંધો. કોથમરું છાંટીને પીરસો."
  },
  {
    title: "Khichu",
    serves: "2 લોકો માટે",
    image: "https://www.cookingcarnival.com/wp-content/uploads/2020/06/KHICHHU-1.jpg",
    ingredients: [
      "ચોખાના લોટ", "હળદર", "મીઠું", "હિંગ", "જીરું",
      "પાણી", "તેલ", "મરચું"
    ],
    instructions: "પાણી ઉકાળી લોટ ઉમેરો. સતત હલાવતા હલાવતા પકાવો. તેલ અને મરચું નાખી પીરસો."
  },
  {
    title: "Dhokla",
    serves: "4 લોકો માટે",
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/08/khaman-dhokla-1.jpg",
    ingredients: [
      "બેસન", "દહીં", "ઈનો", "હળદર", "મીઠું",
      "તેલ", "તલ", "રાય", "હિંગ", "કડીપત્તા"
    ],
    instructions: "બેટર તૈયાર કરો. ઈનો ઉમેરો. વરાળમાં બાફી વઘાર કરો."
  },
  {
    title: "Patra",
    serves: "4 લોકો માટે",
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/10/patra-1.jpg",
    ingredients: [
      "અલૂ ના પાન", "બેસન", "મસાલા", "હળદર", "મીઠું",
      "તલ", "તેલ", "હિંગ", "કોથમરું"
    ],
    instructions: "પાનમાં મસાલો લગાવી વાળી લો. વરાળમાં બાફી તળો અથવા વઘાર કરો."
  },
  {
    title: "Bharela Ringan",
    serves: "3 લોકો માટે",
    image: "https://www.archanaskitchen.com/images/archanaskitchen/1-Author/sibyl_sunitha/Bharwa_Baingan_Gujarati_Style_Stuffed_Brinjal_Sabzi-3.jpg",
    ingredients: [
      "રીંગણ", "મસાલા મિશ્રણ", "તેલ", "હળદર", "મીઠું",
      "હિંગ", "કાંદા"
    ],
    instructions: "રીંગણમાં મસાલો ભરો. ધીમી આંચે ઢાંકી શેકો જ્યાં સુધી નરમ થાય."
  },
  {
    title: "Kadhi",
    serves: "3 લોકો માટે",
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/02/gujarati-kadhi-1.jpg",
    ingredients: [
      "છાશ", "બેસન", "હળદર", "મીઠું", "મીઠો વઘાર",
      "મીઠો", "હિંગ", "જિરું", "કડીપત્તા"
    ],
    instructions: "છાશ અને બેસન મિક્સ કરો. વઘાર સાથે ઉકાળો. કોથમરું છાંટીને પીરસો."
  },
  {
    title: "Dudhi Chana Dal",
    serves: "3 લોકો માટે",
    image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/05/lauki-chana-dal-1.jpg",
    ingredients: [
      "દૂધી", "ચણા દાળ", "હળદર", "મીઠું", "લસણ",
      "હિંગ", "કાંદા", "મીઠો વઘાર"
    ],
    instructions: "દૂધી અને દાળ રાંધો. વઘાર ઉમેરો અને પીરસો."
  }
    ];
    

    for (const recipe of recipes) {
      await Recipe.updateOne(
        { title: recipe.title },
        { $set: recipe },
        { upsert: true }
      );
    }

    console.log("✅ બધી રેસીપી સફળતાપૂર્વક ઉમેરાઈ/અપડેટ થઈ");
    mongoose.disconnect();
  })
  .catch(err => console.error("❌ ડેટાબેઝ ત્રુટિ:", err));
