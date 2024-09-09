const express = require('express');
const app = express();
const driver = require('./driver');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.use(express.json());


app.post('/get', (req, res) => {
    

    if(req.body && req.body.key && req.body.password)
    {
        driver.tryGetSecret(req.body.key,req.body.password).then (secret => {

            if(secret)
            {
                res.json({
                    status: "success",
                    result: 
                    {
                        status:"accessed",
                        secret:secret
                    }
                });
            }
            else {
                res.json({
                    status: "success",
                    result: 
                    {
                        status:"access-denied",
                    }
                });
            }
           
    
        }).catch(e => {
            console.log(e)
    
            res.json({
                status: "failed",
                info: "server-error"
            });
        }); 
    }
    else {
        res.json({
            status: "failed",
            info: "missing-data"
        });
    }

 
});
  
app.post('/purge', (req, res) => {
    
    if(req.body && req.body.key)
    {
        driver.tryDeleteEntry(req.body.key).then ( r => {
        
            
            res.json({
                status: "success",
                result: 
                {
                    status: (r ? "purged" : "access-denied"),
                }
            });


        }).catch(e => {
            console.log(e)
    
            res.json({
                status: "failed",
            });
        }); 


    }
    else {
        res.json({
            status: "failed",
            info: "missing-data"
        });
    }




});
  
app.post('/init', (req, res) => {
    if(req.body && req.body.secret && req.body.password)
    {
        driver.createEntry(req.body.secret,req.body.password,60*60*24*7,3).then(key => {
        
            res.json({
                status: "success",
                result: 
                {
                    status: "created",
                    key: key
                }

            });

        }).catch(e => {
            console.log(e)

            res.json({
                status: "failed",
            });
        }); 

    }
    else {
        res.json({
            status: "failed",
            info: "missing-data"
        });
    }

});

app.post('/update', (req, res) => {
    if(req.body && req.body.key && req.body.secret && req.body.password)
    {
        driver.tryUpdateEntry(req.body.key,req.body.secret ,req.body.password,60*60*24*7,3).then ( r => {

            res.json({
                status: "success",
                result: 
                {
                    status: (r ? "updated" : "access-denied"),
                }
            });

        }).catch(e => {
            console.log(e)

            res.json({
                status: "failed",
            });
        }); 

    }
    else {
        res.json({
            status: "failed",
            info: "missing-data"
        });
    }

});
  