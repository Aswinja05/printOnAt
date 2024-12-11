//commit check

require('dotenv').config();

const express = require('express')
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const FormData = require('form-data');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require("cors");
const sha256 = require("sha256");
const uniqid = require("uniqid");


const app = express()
const PORT = process.env.PORT;




// setting up middleware
app.use(cors({ origin: `http://localhost:${PORT}` }));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);


























const sharp = require('sharp');
async function addTextToImage(filePath, textToAdd) {
    const textBuffer = Buffer.from(
        `<svg>
            <text x="10" y="20" font-size="24" fill="black">${textToAdd}</text>
         </svg>`
    );

    await sharp(filePath)
        .composite([{ input: textBuffer, top: 10, left: 10 }])
        .toFile('modified-' + filePath); // Save as a new file or overwrite
}

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
async function addTextToPDF(filePath, textToAdd) {
    // Read the existing PDF file
    const existingPdfBytes = fs.readFileSync(filePath);

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed a standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Get the first page of the PDF
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Define the text options
    const { width, height } = firstPage.getSize();
    const fontSize = 8;

    // Draw the text on the first page
    firstPage.drawText(textToAdd, {
        x: 25,
        y: 0 + fontSize, // Adjust the y-coordinate to avoid clipping
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0), // Black color for the text
    });

    // Save the modified PDF to a new file
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedFilePath = path.join('modified-uploads', 'modified-' + path.basename(filePath));

    // Ensure the modified-uploads directory exists
    if (!fs.existsSync('modified-uploads')) {
        fs.mkdirSync('modified-uploads');
    }

    fs.writeFileSync(modifiedFilePath, modifiedPdfBytes);
    console.log(modifiedFilePath)
    return modifiedFilePath; // Return the path of the modified PDF
}

mongoose.connect(process.env.MONGO_URL, {})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


const fileSchema = new mongoose.Schema({
    shopownerid: String,
    cId: String,
    UID: String,
    originalname: String,
    mimetype: String,
    size: Number,
    filename: String,
    path: String,
    color: String,
    orien: String,
    copies: String,
    orderReady: Boolean,
    delivered: Boolean,
    payment: Boolean,
    merchantTransactionId: String
});


const printOutletsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    }

})

const shopownerDashboardSettingsSchema = new mongoose.Schema({
    shopownerid: String,
    colorPrice: Number,
    bnwPrice: Number,
    colorAvailable: Number,
    bnwAvailable: Number
})
// Create a 2dsphere index on the location field
printOutletsSchema.index({ location: '2dsphere' });

const File = mongoose.model('File', fileSchema);
const PrintOutlet = mongoose.model('printOutlet', printOutletsSchema)
const shopownerDashboardSettings = mongoose.model('soDashboardSettings', shopownerDashboardSettingsSchema)


const newOutlet = new PrintOutlet({
    name: 'Bhavani Stationary',
    address: 'Chandra Vadana layout,Ramamurthy Nagar,Bangalore-16',
    latitude: 13.0114577,
    longitude: 77.6774711,
    contact: '+91-9876543210',
    city: 'Bangalore',
    location: {
        type: 'Point',
        coordinates: [77.6774711, 13.0114577]
    }
})


// newOutlet.save()
// newOutlet2.save()



// async function findNearbyPrintOutlets() {
//     const searchLatitude = 12.96666;
//     const searchLongitude = 77.7113186;
//     const maxDistance = 5000; // 5 kilometers

//     try {
//         const outlets = await PrintOutlet.find({
//             city: 'Bangalore', // Filter by city
//             location: {
//                 $near: {
//                     $geometry: {
//                         type: 'Point',
//                         coordinates: [searchLongitude, searchLatitude]
//                     },
//                     $maxDistance: maxDistance
//                 }
//             }
//         });

//         console.log('Nearby Print Outlets in Bangalore:', outlets);
//     } catch (error) {
//         console.error('Error finding nearby print outlets:', error);
//     }
// }
// findNearbyPrintOutlets();















app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/main/index.html');
})
app.get('/upload/:shopId', (req, res) => {
    const shopId = req.params.shopId
    res.sendFile(__dirname + '/public/upload/index.html');

})
app.get('/login', async (req, res) => {
    res.sendFile(__dirname + '/public/authentication/index.html')
})
app.get('/history', async (req, res) => {
    res.sendFile(__dirname + '/public/orderHistory/index.html')
})












// /checkout endpoint


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination folder where files will be saved
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Unique file name
    }
});

const upload = multer({ storage: storage });
const form = multer({ storage: multer.memoryStorage() })

// Handle file upload and forward it to /shopowner
app.post('/checkout', upload.single('file'), async (req, res) => {
    let userId = "MUID123";

    let merchantTransactionId = uniqid();


    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const shopownerid = req.body.shopownerid;
    const print_color_settings = req.body.color_settings;
    const print_orientation_settings = req.body.orientation_settings;
    const print_copies = req.body.print_copies;
    const cId = req.body.cId;
    const amount = req.body.amt;
    let fileType = path.extname(req.file.originalname).toLowerCase();
    let UID = crypto.randomInt(10000, 99999).toString();
    let textToAdd = `${UID}`;

    try {
        switch (fileType) {
            case '.pdf':
                await addTextToPDF(req.file.path, textToAdd);
                break;
            case '.pptx':
                await addTextToPptx(req.file.path, textToAdd);
                break;
            case '.docx':
                await addTextToDocx(req.file.path, textToAdd);
                break;
            case '.jpg':
            case '.jpeg':
            case '.png':
                await addTextToImage(req.file.path, textToAdd);
                break;
            default:
                throw new Error('Unsupported file type');
        }

        const modifiedFilePath = path.join('modified-uploads', 'modified-' + path.basename(req.file.path));

        const formData = new FormData();
        formData.append('color_settings', print_color_settings);
        formData.append('orientation_settings', print_orientation_settings);
        formData.append('print_copies', print_copies);
        formData.append('cId', cId);
        formData.append('UID', UID);
        formData.append('originalname', path.basename(modifiedFilePath));
        formData.append('mimetype', req.file.mimetype);
        formData.append('size', req.file.size);
        formData.append('filename', path.basename(modifiedFilePath));
        formData.append('path', modifiedFilePath);
        formData.append('merchantTransactionId', merchantTransactionId);

        const response = await axios.post(`http://localhost:${PORT}/shopowner/${shopownerid}`, formData, {
            headers: {
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });





        let normalPayLoad = {
            merchantId: MERCHANT_ID, //* PHONEPE_MERCHANT_ID . Unique for each account (private)
            merchantTransactionId: merchantTransactionId,
            merchantUserId: userId,

            amount: amount * 100,
            redirectUrl: `https://9dea-2401-4900-9004-7e12-8191-55a0-6084-1949.ngrok-free.app/payment/validate/${merchantTransactionId}`,
            redirectMode: "REDIRECT",
            mobileNumber: "9999999999",
            paymentInstrument: {
                type: "PAY_PAGE",
            },
        };


        let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
        let base64EncodedPayload = bufferObj.toString("base64");


        let string = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
        let sha256_val = sha256(string);
        let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

        axios
            .post(
                `${PHONE_PE_HOST_URL}/pg/v1/pay`,
                {
                    request: base64EncodedPayload,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-VERIFY": xVerifyChecksum,
                        accept: "application/json",
                    },
                }
            )
            .then(function (response) {
                // console.log("response->", JSON.stringify(response.data));

                // console.log("response url:", response.data.data.instrumentResponse.redirectInfo.url)
                res.json({ url: response.data.data.instrumentResponse.redirectInfo.url })
            })




        console.log('File metadata successfully forwarded to /shopowner');


    } catch (error) {
        console.error('Error forwarding file metadata to /shopowner:', error);
        res.status(500).json({ message: 'Failed to forward the file metadata to /shopowner', error: error.message });
    }
});


// UAT environment
const MERCHANT_ID = "PGTESTPAYUAT86";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const APP_BE_URL = "http://localhost:5000";
app.get("/payment/validate/:merchantTransactionId", async function (req, res) {
    const { merchantTransactionId } = req.params;
    if (merchantTransactionId) {
        let statusUrl =
            `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/` +
            merchantTransactionId;

        // generate X-VERIFY
        let string =
            `/pg/v1/status/${MERCHANT_ID}/` + merchantTransactionId + SALT_KEY;
        let sha256_val = sha256(string);
        let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

        axios
            .get(statusUrl, {
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": xVerifyChecksum,
                    "X-MERCHANT-ID": merchantTransactionId,
                    accept: "application/json",
                },
            })
            .then(async function (response) {
                if (response.data && response.data.code === "PAYMENT_SUCCESS") {

                    const a = await File.updateOne({ merchantTransactionId: merchantTransactionId }, { $set: { payment: true } })
                    // res.send('Hello payment hogaya')
                    // res.send(JSON.stringify({ message: 'Order received successfully', redirectTo: '/main' }));
                    res.send(` 
                        <html> 
                            <head> 
                                 <meta http-equiv="refresh" content="3;url=/main" />  

                            </head>
                            
                            <body> 
                                <div style="font-size: 35px;padding: 50vh 10px;height: 100vh;text-align: center;font-size: 70px;background-color: rgb(23 48 84);color: white;border:2px solid black;">Order Placed Successfully</div>
                            </body> 
                        </html> `);
                } else {
                    // redirect to FE payment failure / pending status page
                    // console.log("response.data not found")

                }
            })
            .catch(function (error) {
                console.error("Payment Status Check Error:", error.response?.data || error.message);
                res.status(500).json({ message: "Error fetching payment status", error: error.message });
            });
    } else {
        res.send("Sorry!! Error");
    }
});

{/* <meta http-equiv="refresh" content="3;url=/main" />  */ }


app.post('/shopowner/:shopownerid', upload.none(), async (req, res) => {
    const shopownerid = req.params.shopownerid;
    // console.log("/shopowner/:shopownerid body:",req.body)
    try {
        // Store file details and shopownerid in MongoDB (without actual file upload)
        const newFile = new File({
            shopownerid: shopownerid,
            cId: req.body.cId,
            UID: req.body.UID,
            originalname: req.body.originalname,
            mimetype: req.body.mimetype,
            size: req.body.size,
            filename: req.body.filename,
            path: req.body.path,
            color: req.body.color_settings,
            orien: req.body.orientation_settings,
            copies: req.body.print_copies,
            uploadDate: new Date(),
            orderReady: false,
            delivered: false,
            payment: false,
            merchantTransactionId: req.body.merchantTransactionId
        });

        await newFile.save();

        res.json({
            message: 'File metadata stored successfully for shopowner',
            file: newFile
        });
    } catch (error) {
        console.error('Error storing file metadata:', error);
        res.status(500).json({ message: 'Failed to store the file metadata in MongoDB' });
    }
});




app.get('/shopowner/:shopownerid', async (req, res) => {
    const shopownerid = req.params.shopownerid;

    try {
        // Find files for the given shopownerid in MongoDB
        const files = await File.find({ shopownerid: shopownerid });

        if (!files.length) {
            return res.status(404).json({ message: 'No files found for this shopowner.' });
        }

        res.json({
            message: 'Files retrieved successfully',
            files: files
        });
    } catch (error) {
        console.error('Error retrieving files:', error);
        res.status(500).json({ message: 'Failed to retrieve files from MongoDB' });
    }
});


app.get('/findShopDetails/:shopid', async (req, res) => {
    const shopid = req.params.shopid;
    try {
        const op = await PrintOutlet.find({ _id: shopid })
        res.json({
            body: op
        });
    }
    catch (error) {
        console.error('Error retrieving details:', error);

    }
})



// Endpoint to download the file based on file ID (or filename)
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;

    // Path to the uploads folder
    const filePath = path.join(__dirname, 'modified-uploads', filename); // Full path to the file

    // Check if file exists
    if (fs.existsSync(filePath)) {
        // Send the file to the user for download
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Error sending the file:', err);
                res.status(500).send('Error occurred while downloading the file.');
            }
        });
    } else {
        // File not found
        res.status(404).send('File not found.');
    }
});

app.get('/files/:shopownerid', async (req, res) => {
    const shopownerid = req.params.shopownerid;

    try {
        // Fetch files for a specific shop owner
        const files = await File.find({ shopownerid });

        // Respond with a list of files (or provide download links)
        res.json({
            message: 'Files fetched successfully',
            files: files.map(file => ({
                originalname: file.originalname,
                downloadLink: `/download/${file.filename}` // Provide download link for each file
            }))
        });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Failed to fetch files' });
    }
});






app.get('/searchNearby/:latitude/:longitude', async (req, res) => {
    const searchLatitude = req.params.latitude;
    const searchLongitude = req.params.longitude;
    const maxDistance = 5000;

    try {
        const outlets = await PrintOutlet.find({
            city: 'Bangalore', // Filter by city
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [searchLongitude, searchLatitude]
                    },
                    $maxDistance: maxDistance
                }
            }
        });

        // console.log('Nearby Print Outlets in Bangalore:', outlets);

        res.json({
            message: 'Nearby PrintOutlets',
            body: outlets
        });
    } catch (error) {
        console.error('Error retrieving Nearby outlets:', error);
        res.status(500).json({ message: 'Failed to retrieve Nearby outlets from MongoDB' });
    }
});









//USER AUTHENTICATION

const UserSchema = new mongoose.Schema({
    name: { type: String },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema)


// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aswinja05@gmail.com',
        pass: process.env.NODEMAILER // Use an App Password if 2FA is enabled
    }
});
// In-memory storage for simplicity
let otpStorage = {};
// Generate a random OTP
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

// Send OTP email
function sendOTPEmail(email, otp, text) {
    const mailOptions = {
        from: 'aswinja05@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: text
    };

    return transporter.sendMail(mailOptions);
}

// Endpoint to request OTP
app.post('/request-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('Email is required');
    }

    const otp = generateOTP();

    try {
        await sendOTPEmail(email, otp, `Your OTP code is: ${otp}`);

        otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP valid for 5 minutes
        res.send(JSON.stringify('OTP sent to your email'));
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).send('Error sending OTP');
    }
});





// Endpoint to verify OTP
app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).send(JSON.stringify('Email and OTP are required'));
    }

    const storedOtpData = otpStorage[email];

    if (!storedOtpData) {
        return res.status(400).send(JSON.stringify('OTP not requested'));
    }

    if (Date.now() > storedOtpData.expiresAt) {
        return res.status(400).send(JSON.stringify('OTP has expired'));
    }

    if (storedOtpData.otp === otp) {
        delete otpStorage[email];
        const user = await User.findOne({ email });
        if (!user) {
            res.send(JSON.stringify({
                message: 'You are a new user. Please provide your name and phone number.',
                isNewUser: true
            }));
        }
        else {
            res.send(JSON.stringify({
                message: 'OTP verified successfully',
                isNewUser: false,
                // redirectTo: 'back', // Redirect URL
                redirectTo: '/main',
                isLoggedIn: true,      // Login status
                cId: user._id
            }));
        }
    } else {
        res.status(400).send(JSON.stringify('Invalid OTP'));
    }
});



// Endpoint to save new user details
app.post('/save-new-user', async (req, res) => {
    const { email, name, phone } = req.body;

    if (!email || !name || !phone) {
        return res.status(400).send('Name, phone number, and email are required');
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).send('User already exists');
        }

        // Create a new user record
        user = new User({
            name,
            phone,
            email,
            isVerified: true // Mark as verified since OTP was confirmed
        });

        await user.save();
        res.send(JSON.stringify({
            message: 'User Created Successfully',
            isNewUser: false,
            redirectTo: '/main', // Redirect URL
            isLoggedIn: true,      // Login status
            cId: user._id
        }));
    } catch (error) {
        console.error('Error saving new user:', error);
        res.status(500).send('Internal server error');
    }
});






//Find customer details

app.get('/findCustomer/:cId', async (req, res) => {
    let cId = req.params.cId;
    try {
        if (cId !== "undefined") {
            const op = await User.findOne({ _id: cId })

            res.send({
                body: op
            });
        }
    }
    catch (error) {
        console.error('Error retrieving details:', error);

    }
})

app.post('/UpdatePrintSettings/:shopownerid', async (req, res) => {
    const update = await shopownerDashboardSettings.updateOne({ shopownerid: req.params.shopownerid }, { $set: { colorPrice: req.body.color, bnwPrice: req.body.bnw, colorAvailable: req.body.colorAvailable, bnwAvailable: req.body.bnwAvailable } })
})




//Marking as orderReady

app.post('/orderReady', async (req, res) => {
    // const { cId, sId } = req.body;

    // if(!cId || !sId){
    //     res.send({
    //         body: `Either CID or SID not available`
    //     })
    // }

    const { UID } = req.body;

    try {
        let update = await File.updateOne({ UID: UID }, { $set: { orderReady: true } })
        let updateDoc = await File.findOne({ UID: UID })
        let custID = updateDoc.cId
        let op = await User.findOne({ _id: custID })
        // console.log(op.email)
        const mailOptions = {
            from: 'aswinja05@gmail.com',
            to: op.email,
            subject: 'Your Files are Ready!!',
            text: `YOUR DELIVERY CODE:${UID}.Present the above code at the PrintOnAt outlet`
        };

        await transporter.sendMail(mailOptions);

        res.send("Updated DataBase")


    }
    catch {
        res.send("Error Updating DB to orderReady")
    }


})


app.post('/orderDelivery', async (req, res) => {
    let UID = req.body.Dcode;
    try {
        let update = await File.updateOne({ UID: UID }, { $set: { delivered: true } })
        let updateDoc = await File.findOne({ UID: UID })
        let custID = updateDoc.cId
        let op = await User.findOne({ _id: custID })
        const mailOptions = {
            from: 'aswinja05@gmail.com',
            to: op.email,
            subject: 'Your Files are Ready!!',
            text: `Thank you for using PrintAtOn!! Your Documents have been delivered`
        };

        await transporter.sendMail(mailOptions);
        res.send("Updated DataBase")
    }
    catch {
        res.send("Error Updating DB to orderReady")
    }
})


app.get('/orderHistory/:cId', async (req, res) => {
    let cId = req.params.cId;

    const data = await File.find({ cId: cId });
    res.send(data)
})



app.post('/verify-so', async (req, res) => {
    const { sid, pw } = req.body;
    if (!sid || !pw) {
        return res.status(400).send(JSON.stringify('SID and Password are required'));
    }


    if (sid) {

        const user = await PrintOutlet.findOne({ _id: sid });
        if (!user) {
            res.send(JSON.stringify({
                message: 'User no found...Check the SID'
            }));
        }
        else {
            res.send(JSON.stringify({
                message: 'SO verified successfully',
                isLoggedIn: true,      
                sId: sid
            }));
        }
    } else {
        res.status(400).send(JSON.stringify('Invalid User'));
    }
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});