
module.exports = {
    createUser: async (user) => {
        const hostNme = user.queryResult.outputContexts[5].parameters.hostname;
        const description = user.queryResult.outputContexts[5].parameters.description;
        console.log(hostNme);
        console.log(description);
        //fetch to Saar

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