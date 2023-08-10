class Authentication {
    constructor() {
        this.grant_type = "client_credentials";
        this.client_id = "3e83c8dd-fb2a-40d2-984d-b592597e2622";
        this.scope = "api://3e83c8dd-fb2a-40d2-984d-b592597e2622/.default";
        this.client_secret = "mZv8Q~-xHsYcuusAa1tCw0s.MREasvk7j70pobAl";
    }

    async authenticate() {
        await fetch("https://login.microsoftonline.com/e7c72598-c7ab-48a2-8f4b-398aad8e1daa/oauth2/v2.0/token", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Authentication),
        })
        .then((response) => response.json())
        .then((data) => {         
            console.log("success: ",data);
            return data;
        })
        .catch((error) => {
            console.log(error);
        });
    }
}