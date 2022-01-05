
module.exports = {
    createUser: async (user) => {
        const hostNme = user.queryResult.outputContexts[5].parameters.hostname;
        const description = user.queryResult.outputContexts[5].parameters.description;
        console.log(hostNme);
        console.log(description);
        //fetch to Saar

    },

    checkRequest: async (body) =>{
        const requestType = body.queryResult.action;
        console.log(typeof(requestType));
        if(requestType.includes("CreateNewHost"))
        {
            console.log(requestType);
            return "create";
        }
        //Need to add else if for the rest of the skills
        
    },
    
    // getUsers: async () => {
    //     const conn = await getCon()
    //     const [rows] = await conn.execute('SELECT * FROM `users-crud`.users');
    //     return rows
    // },
    // getUserById: async (id) => {
    //     const conn = await getCon()
    //     const [rows] = await conn.execute(`SELECT * FROM users where id=${id}`);
    //     return rows[0]
    // },

    // updateUser: async (id, data) => {
    //     let update = Object.entries(data).map(([key, value]) => `${key}='${value}'`)
    //     const conn = await getCon()
    //     const result = await conn.execute(`
    //         UPDATE users
    //         SET ${update.join(', ')}
    //         WHERE id = ${id};
    //      `);
    //     return result
    // },
    // deleteUser: async (id) => {
    //     const conn = await getCon()
    //     const result = await conn.execute(`
    //         DELETE FROM users WHERE id = ${id}
    //      `);
    //     return result
    // },
}