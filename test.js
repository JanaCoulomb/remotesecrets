//TODO: rework this test script
require('dotenv').config()

const baseUrl = process.env.TESTURL || ('http://localhost:'+(process.env.PORT || 3000));

async function singleTest (route,json,expectedStatus) {
    console.log("Running",route,"and expecting HTTP Status Code",expectedStatus)
    const j1 = await doPostFetch(baseUrl+"/"+route,json)
    
    if(!j1 || j1.status != expectedStatus)
    {
        console.log("Test failed!"); 
        return false;
    }
    console.log("Test passed!"); 
    return j1.json;

}

async function test () {

    var res;
    if(!(res = await singleTest("init",{password:"password",secret:"secret"},200)))
        return;

    key = res.key;

    if(!(res = await singleTest("get",{password:"password",key:key},200)))
        return;

    if(!(res = await singleTest("get",{password:"wrongpassword",key:key},401)))
        return;

    if(!(res = await singleTest("update-password",{password:"password",key:key,newPassword:"newpassword"},200)))
        return;

    if(!(res = await singleTest("get",{password:"password",key:key},401)))
        return;

    if(!(res = await singleTest("get",{password:"newpassword",key:key},200)))
        return;

    if(!(res = await singleTest("purge",{password:"newpassword",key:key},200)))
        return;

    if(!(res = await singleTest("get",{password:"newpassword",key:key},404)))
        return;


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

        console.log(' Fetch Result ');
        console.log(' | Status Code:', res.status);
        const json = await res.json();

        console.log(' | Json Data:', json);
        return {status:res.status,json:json};

    } catch (err) {
        console.log(err.message); //can be console.error
    }
}


test();