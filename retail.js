/// Setup the Cisco Spark Websocket

var SparkWebSocket = require('ciscospark-websocket-events')
var request = require('request')
var accessToken = process.env.SPARK_TOKEN
var Promise = require('bluebird')
var PORT = process.env.PORT || 3000

var webHookUrl =  "http://localhost:"+PORT+"/ciscospark/receive"
var sipUri = "[Tap Here](ciscospark://call?sip=sip:81163422@cisco.com)"
sparkwebsocket = new SparkWebSocket(accessToken)
sparkwebsocket.connect(function(err,res){
   if (!err) {
         if(webHookUrl)
             sparkwebsocket.setWebHookURL(webHookUrl)
   }
   else {
        console.log("Error starting up websocket: "+err)
   }
})

//////// Bot Kit //////
var blenderList =[ { displayName: 'KitchenAid&#174; 5-Speed Blender KSB1570',
    imageURL: 'https://www.webstaurantstore.com/images/products/extra_large/107096/558651.jpg',
    productURL: '/p/kitchenaid-174-5-speed-blender-ksb1570/-/A-16233099',
    productId: '2877786',
    content:'The KitchenAid 5-Speed Blender is the perfect tool for your kitchen.',
    price:"$99.99" },
  { displayName: 'NutriBullet Rx 1700-Watt Blender by Magic Bullet',
    imageURL: 'https://www.nutribullet.com/rebrand/img/nutribullets-alt.jpg',
    productURL: '/p/nutribullet-rx-1700-watt-blender-by-magic-bullet/-/A-15632682',
    productId: '2248166',
    content: 'Eat SMART with the NutriBullet Rxâ€”the most technologically advanced NutriBullet to date.',
    price:"$116.99" },
  { displayName: 'Ninja&#174; Professional Kitchen System',
      imageURL: 'https://i.ytimg.com/vi/orG2b_a7BgE/maxresdefault.jpg',
      productURL: '/p/ninja-174-professional-kitchen-system/-/A-44363628',
      productId: '1974445',
      content: 'Create delicious & nutritious smoothies, easily mix ingredients & blend up scrumptious creations of all kinds.',
      price:"$199.99" } ]



var Botkit = require('botkit');

var controller = Botkit.sparkbot({
    debug: true,
    log: true,
    public_address: "https://localhost",
    ciscospark_access_token: process.env.SPARK_TOKEN
});


var bot = controller.spawn({
});

controller.setupWebserver(PORT, function(err, webserver) {

 //setup incoming webhook handler
  webserver.post('/ciscospark/receive', function(req, res) {
            res.sendStatus(200)
            controller.handleWebhookPayload(req, res, bot);
  });

});




controller.hears(['.*search for blender.*'], 'direct_message,direct_mention', function(bot, message) {

bot.reply(message, {markdown:"**_Here's what I found:_** <br>"})
  Promise.map(blenderList, function(product){
    return new Promise(function (resolve, reject) {

           content = product.content +"<br>**Price: "+product.price+"**"



            console.log("----------------------")
            console.log(content)
            console.log(("----------------------"))
            var productUrl = product.productURL;
            bot.reply(message, {markdown:"**["+product.displayName+"]("+productUrl+")**<br>"+content+"<hr>",files:[product.imageURL]}, function(error,mes){
              if (!error)
              {
                console.log("Posted message")
                resolve(mes)
              }
              else {
                  console.log("Error!!!")
                reject(error)
              }
            })


      })


 },{concurrency:1})

})


controller.hears(['^help'], 'direct_message,direct_mention', function(bot, message) {

  bot.reply(message, {markdown:"Hi there! You can use me to search for products that are available at Ocsic Retail Shop. <br><br>_For example, to search for blenders type:_\n\n>**@Retail search for blenders**\n\n_And I'll return a list of blenders for you to check out._<br><br>_If you need more info on a paticular blender, just ask me by typing:_\n\n>**@Retail tell me more about the Ninja blender**<br>\n\n<br>_If want to get an independent review on a product, just ask me by typing:_\n\n>**@Retail can I get an independent review on the Ninja blender**<br>\n\n<br>_At anytime if you would like to talk to a customer support representative, just type:_\n\n>**@Retail can someone help me?**<br> "});
})

controller.hears(['.*tell me more about (.*)'], 'direct_message,direct_mention', function(bot, message) {
  //detailed blender
  html = "<br><ul><li> Create delicious & nutritious smoothies, easily mix ingredients & blend up scrumptious creations of all kinds <br><li>  5 speed settings for custom blending<br><li> Durable, stainless steel blades<br><li> Crushes ice, purees, mixes, chops & blends with the simple push of a button<br><li> Dishwasher safe parts for quick & easy cleanup<br><li> Includes: XL Total Crushing Blender Pitcher, 8-Cup food processor bowl & 2 Nutri Ninja Cups (18 & 24 oz.) with Sip & Seal Lids</ul><br><br> The Ninja Professional Kitchen System is a powerful small kitchen appliance designed to help you create culinary masterpieces. Whether you're looking to use the Nutri Ninja cups to make healthy smoothies or you want to go all out and create a masterpiece that would knock the socks off of any guest, the Ninja blender has got you covered."
    bot.reply(message, {markdown:"**Here is more info on the Nutri Ninja Blender:**"},function (err,mess){
        bot.reply(message, {markdown:html,files:['https://i.ytimg.com/vi/orG2b_a7BgE/maxresdefault.jpg']});
    });

})


controller.hears(['.*independent review.*'], 'direct_message,direct_mention', function(bot, message) {

      bot.reply(message, {markdown:"**Here's a review from CNET:**"}, function(err,mes){
        var file = "https://cisco.box.com/shared/static/83bvo3e3j9lvym0a4t79942wosu9l86w.png"
        var content ="**The Good** / The **Ninja** blender performs as well as models that cost twice as much.<br><br>"

        content +="**The Bad** / The **Ninja** looks bulky and you may not like having to keep track of the various accessories.<br><br>"

        content +="**The Bottom Line**  / If you're looking for a blender that can replace a lot of your small appliances without breaking the bank, you can't go wrong with the reasonably priced **Ninja Blender**."

       bot.reply(message, {markdown:content,files:[file]});

      });

})

controller.hears(['.*help me.*'], 'direct_message,direct_mention', function(bot, message) {
  bot.reply(message, {markdown:"Sure we can help you! Tap the link below to be connected with a customer support representative<br><br> "+sipUri+" <br>"});

})


controller.hears(['set uri (.*)'], 'direct_message,direct_mention', function(bot, message) {
  sipUri = message.match[1]
  bot.reply(message, {markdown:"new sip uri set"});
})
