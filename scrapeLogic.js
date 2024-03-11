const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (req,res) => {
  const searchTerm = req.query.searchTerm;
  console.log(searchTerm)
  var url = `https://news.google.com/search?q=%22${searchTerm}%22%20when%3A1d&hl=en-IN&gl=IN&ceid=IN%3Aen`
  const browser = await puppeteer.launch({
    headless:true,
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
  // try {
  //   const page = await browser.newPage();

  //   await page.goto("https://news.google.com/search?q=meta%20when%3A1d&hl=en-IN&gl=IN&ceid=IN%3Aen");

  //   const url = page.url()

  //   // Set screen size
  //   await page.setViewport({ width: 1080, height: 1024 });

  //   // Type into search box
  //   // await page.type(".search-box__input", "automate beyond recorder");

  //   // Wait and click on first result
  //   // const searchResultSelector = ".search-box__link";
  //   // await page.waitForSelector(searchResultSelector);
  //   // await page.click(searchResultSelector);

  //   // Locate the full title with a unique string
  //   // const textSelector = await page.waitForSelector(
  //   //   "text/Customize and automate"
  //   // );
  //   // const fullTitle = await textSelector.evaluate((el) => el.textContent);

  //   // // Print the full title
  //   // const logStatement = `The title of this blog post is ${fullTitle}`;
  //   // console.log(logStatement);
  //   res.send(url);
  // } catch (e) {
  //   console.error(e);
  //   res.send(`Something went wrong while running Puppeteer: ${e}`);
  // } finally {
  //   await browser.close();
  // }


  try {
    const page = await browser.newPage();
    var newsList = []
    console.log("Opening Google News...")
    await page.goto(url)
    await new Promise(r => setTimeout(r, 5000));
    await page.setViewport({ width: 1080, height: 1024 });


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
