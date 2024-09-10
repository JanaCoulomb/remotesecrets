const express = require('express');
const app = express();
const driver = require('./helpers/driver');
const util = require('./helpers/util');
require('dotenv').config()

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

//use express-bouncer to limit the amout of calls possible
var bouncer = require ("express-bouncer")(500, 900000,8);
bouncer.blocked = ((req, res, next, remaining) => {
    res.status(429).json({
        message: "Too many requests have been made. Please wait.",
        remaining: remaining
    });
})
app.use(bouncer.block)

app.use(express.json());

//check if body exitsts middleware

var checkJsonBody = ((req,res) => {
    if(!req.body)
    {
        res.status(400).json({
            error: "body",
            message: "Could not get json body"
        });
        return false;
    }   

    return true;


})

var getEntry = async (req,res) => {

    if(!req.body.key || !req.body.password)
    {
        res.status(401).json({
            error: "field",
            message: "You are missing fields"
        });
        return false;
    }
    

    try {
        entry = await driver.getEntry(req.body.key);
    } catch (error) {
        res.status(500).json({
            error: "database"
        });
        return false;
    }

    if(!entry)
    {
        res.status(404).json({
            error: "key",
            message: "Could not find entry for key"
        });
        return false;
    }

    if(entry["entry_failed_tries"] >= entry["entry_max_failed_tries"])
    {
        res.status(401).json({
            error: "tries",
            message: "You tried too often"
        });
        return false;
    }

    let currentTimeSeconds = util.currentTimeSeconds();

    if(entry["entry_expire_time"] + entry["entry_last_success_date"] < currentTimeSeconds)
    {
        res.status(401).json({
            error: "expire",
            message: "This entry has expired"
        });
        return false;
    }


    
    if(!entry["entry_password_hash"].equals(Buffer.from(await util.hashString(req.body.password))))
    {
        res.status(401).json({
            error: "password",
            message: "Wrong Password"
        });
        driver.incrementEntryFailedTries(req.body.key);

        return false;
    }

    driver.resetEntryFailedTriesAndTime(req.body.key,currentTimeSeconds);

    return entry;
}


//get secerts
app.post('/get', async (req, res) => {

    if (!checkJsonBody(req, res))
        return;

    let entry;

    if(entry = await getEntry(req,res))
    {
        res.status(200).json({
            secret: entry["entry_secret"]
        });
    }

})

  
app.post('/purge', async (req, res) => {
    
    if (!checkJsonBody(req, res))
        return;

    let entry;

    if(entry = await getEntry(req,res))
    {
        try {
            await driver.deleteEntry(req.body.key);
            res.status(200).json({});
        } catch (error) {
            res.status(500).json({
                error: "database"
            });
        }
    }

 




});
  
app.post('/init', async (req, res) => {

    if (!checkJsonBody(req, res))
        return;

    if(!req.body.secret || !req.body.password)
    {
        res.status(401).json({
            error: "field",
            message: "You are missing fields"
        });
        return;
    }

    let key = crypto.randomUUID()

    try {
        await driver.createEntry(key,req.body.secret,await util.hashString(req.body.password),60*60*24*7,3,util.currentTimeSeconds());
        res.status(200).json({
            key: key
        });
    } catch (error) {
        res.status(500).json({
            error: "database"
        });
    }

});

app.post('/update-password', async (req, res) => {


    if(!req.body.newPassword)
    {
        res.status(401).json({
            error: "field",
            message: "You are missing fields"
        });
            return;
    }
    
    
    if (!checkJsonBody(req, res))
        return;

    let entry;

    if(entry = await getEntry(req,res))
    {

        
        try {
            await driver.updateEntryPassword(req.body.key,await util.hashString(req.body.newPassword));
            res.status(200).json({});
        } catch (error) {
            res.status(500).json({
                error: "database"
            });
        }
    }

});
  