// Docs
// opencv4 = https://docs.opencv.org/4.x/index.html
// Tesseract = https://github.com/naptha/tesseract.js
// Jimp = https://jimp-dev.github.io/jimp/

const cv = require("opencv4nodejs-prebuilt-install")
const Tesseract = require("tesseract.js")
const { Jimp } = require("jimp")

// Test script, needs to be improved a lot -> yay more work for future me
async function detectIconAndText() {
    const screenshotPath = "Src/Pattern/Screenshots/image.png"
    const templatePath = "Src/Pattern/Icons/icon.png"

    // Load the image and icon
    const img = await cv.imreadAsync(screenshotPath)
    const template = await cv.imreadAsync(templatePath)

    // Look for a match
    const matched = img.matchTemplate(template, cv.TM_CCOEFF_NORMED)
    const { maxLoc, maxVal } = matched.minMaxLoc()

    if (maxVal < 0.4) {
        return console.log(`Icon not found`)
    }

    const roi = img.getRegion(new cv.Rect(maxLoc.x, maxLoc.y, template.cols, template.rows))
    const roiPath = "Src/Pattern/out/roi.png"
    await cv.imwriteAsync(roiPath, roi)

    // Check for a text located area where the icon was found
    const jimpImg = await Jimp.read(roiPath)

    jimpImg
        .crop({ x: 0, y: 28,w: 43, h: 15})
        .resize({ w: jimpImg.bitmap.width * 2, h: jimpImg.bitmap.height * 2, mode: Jimp.RESIZE_BILINEAR })
        .contrast(1)
        .greyscale()
        .blur(1)
        .write(roiPath)

    const { data } = await Tesseract.recognize(roiPath, "eng", {
        tessedit_char_whitelist: "0123456789.K",
    })

    // Output to check if the text is correct
    console.log("Text:", data.text.trim())
}

detectIconAndText();
