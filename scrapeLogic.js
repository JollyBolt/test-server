const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (req,res) => {
  const searchTerm = req.query.searchTerm;
  console.log(searchTerm)
  var url = `https://news.google.com/search?q=%22${searchTerm}%22%20when%3A1d&hl=en-IN&gl=IN&ceid=IN%3Aen`
  const browser = await puppeteer.launch({
    headless:true,
    defaultViewport: false,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  try {
    const page = await browser.newPage();
    var newsList = []
    console.log("Opening Google News...")
    try{
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 5000 });
    }
    catch{
      console.log("Continuing without full load")
    }
    
    newsList = await page.$$eval('.JtKRv', elements => {
      return elements.map(element => {
        return {
          textContent: element.textContent,
          href: "https://news.google.com/" + element.getAttribute('href').slice(2)
        };
      });
    })
    res.status(200).json(newsList)
  } catch (error) {
    res.status(500).send("Could not reach Google News. Try again later.")
  } finally{
    await browser.close();
  }
};

module.exports = { scrapeLogic };
