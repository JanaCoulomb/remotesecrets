//TODO: rework this test script

const baseUrl = process.env.TESTURL || ('http://localhost:'+(process.env.PORT || 3000));

async function test () {

    console.log("Running /init test")
    const j1 = await doPostFetch(baseUrl+"/init",{password: "1234",secret: "1234"})
    

    if(!(j1.result.status == "created"))
    {
        console.log("Test failed!"); 
        return;
    }
    console.log("Test passed!"); 

    console.log("Running /get test")

    const j2 = await doPostFetch(baseUrl+"/get",{key: j1.result.key,password: "1234"})


    if(!(j2.result.status == "accessed"))
    {
        console.log("Test failed!"); 
        return;
    }
    console.log("Test passed!"); 

    console.log("Running /get test negativ")


    const j3 = await doPostFetch(baseUrl+"/get",{key: j1.result.key,password: "12345"})


    if(!(j3.result.status == "access-denied"))
    {
        console.log("Test failed!"); 
        return;
    }
    console.log("Test passed!"); 

    console.log("Running /update test")

    
    const j4 = await doPostFetch(baseUrl+"/update",{key: j1.result.key,password: "12345",secret: "1234"})
       

    if(!(j4.result.status == "updated"))
    {
        console.log("Test failed!"); 
        return;
    }
    console.log("Test passed!"); 

    console.log("Confirming /update test wuth a /get test")


    const j5 = await doPostFetch(baseUrl+"/get",{key: j1.result.key,password: "12345"})


    if(!(j5.result.status == "accessed"))
    {
        console.log("Test failed!"); 
        return;
    }
    console.log("Test passed!"); 

    console.log("Running /purge test")


    const j6 = await doPostFetch(baseUrl+"/purge",{key: j1.result.key})


    if(!(j6.result.status == "purged"))
    {
        console.log("Test failed!"); 
        return;
    }
    console.log("Test passed!"); 
        
    console.log("Confirming /purge test wuth a /get test")


    const j7 = await doPostFetch(baseUrl+"/get",{key: j1.result.key,password: "12345"})
    

    if(!(j7.result.status == "access-denied"))
    {
        console.log("Test failed!"); 
        return;
    }
    console.log("Test passed!"); 

    console.log("All 7/7 tests passed!"); 


}

async function doPostFetch (url,data) {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        
        console.log('Running POST for:', url);

        const res = await fetch(url,{
            method: "POST",
            body: JSON.stringify(data),
            headers: myHeaders,

        });
        const json = await res.json();

        console.log(' Fetch Result ');
        console.log(' | Status Code:', res.status);
        console.log(' | Json Data:', json);
        return json;

    } catch (err) {
        console.log(err.message); //can be console.error
    }
}


test();