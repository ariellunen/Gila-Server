import ZabbixSender from 'node-zabbix-sender';

export const zabbixMiddleware = (req , res , next) =>{
    try{
        const sender = new ZabbixSender({host});
        req.sender = sender;
    }catch(error){
        console.log("Didn't create sender");
    };
    next()
};


//export const getRequest()