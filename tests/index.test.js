const { default: axios } = require("axios");

function sum(a, b) {
  return a + b
}

const BACKEND_URL = "http://localhost:3000"

describe("Authentication", () => {
    test('User is able to sign up only once', async () => {
        const username = "demo" + Math.random();
        const password = "123456";
        const response =  await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username,
            password,
            type: "admin"
        })
        expect(response.statusCode).toBe(200);

        const updatedResponse =  await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username,
            password,
            type: "admin"
        })
        expect(updatedResponse.statusCode).toBe(400);
    })

    test('User signup request fails if fields are empty', async () => {
        const username = `demo-${Math.random()}`
        const password = "123456"

        const usernameResponse = axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password,
            type:"admin"
        })

        expect(usernameResponse.statusCode).toBe(400)

        const passResponse = axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            type:"admin"
        })

        expect(passResponse.statusCode).toBe(400)
    })

    test('Signin succeds if username and password are correct', async() => {
        const username = `demo-${Math.random()}`
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
        })

        expect(response.statusCode).toBe(200)
        expect(response.body.token).toBeDefined()
    })

    test('Signin fails if username and password are incorrect', async() => {
        const username = `demo-${Math.random()}`
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username : 'demodemo',
            password,
        })

        expect(response.statusCode).toBe(403)
    })
})

describe("User MetaData endpoints", () => {
    let token = "";
    let avatarId = "";

    beforeAll( async () => {
        const username = "demo" + Math.random();
        const password = "123456";
          await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username,
            password,
            type: "admin"
        })

         await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username,
            password,
        })

        //token as a response 
        token = response.data.token
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://w7.pngwing.com/pngs/993/275/png-transparent-pixel-art-meme-avatar-others-culture-meme-fictional-character-thumbnail.png",
            "name" : "demo"
        })

        avatarId = avatarResponse.data.avatarId;

    })
    
    test("User cant update their metadata with a wrong avatarId", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/users/metadata`, {
            avatarId : "@13232"
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("User can update their metadata with avatarId", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/users/metadata`, {
            avatarId : avatarId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(200);
    })

    test("User can't update their metadata with avatarId without auth header", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/users/metadata`, {
            avatarId : avatarId
        })

        expect(response.statusCode).toBe(403);
    })

})

describe("User avatar information", () => {
    let avatarId;
    let token;
    let userId;
    beforeAll( async () => {
        const username = "demo" + Math.random();
        const password = "123456";
          const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username,
            password,
            type: "admin"
        })

        userId = signUpResponse.data.userId

         await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username,
            password,
        })

        //token as a response 
        token = response.data.token
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://w7.pngwing.com/pngs/993/275/png-transparent-pixel-art-meme-avatar-others-culture-meme-fictional-character-thumbnail.png",
            "name" : "demo"
        }, {
            headers: {
                "Authorization" : `Bearer ${adminToken}`
            }
        })

        avatarId = avatarResponse.data.avatarId;

    })

    test("Get back avatar information for user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`)

        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Get all the avatars", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`)
        expect(response.data.avatars.length).not.toBe(0);
        const currAvatar = response.data.avatars.find(x => x.id == avatarId);
        expect(currAvatar).toBeDefined();
    })
})

describe("Space information", () => {
    let mapId ;
    let element1Id;
    let element2Id;
    let adminToken;
    let userToken;
    let userId;
    let adminId;

    beforeAll( async () => {
        const username = "demo" + Math.random();
        const password = "123456";
        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username,
            password,
            type: "admin"
        })

        adminId = signUpResponse.data.userId

        await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username,
            password,
        })

        adminToken = response.data.token

        const userSignUpResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username : username + "-user",
            password,
            type: "user"
        })

        userId = userSignUpResponse.data.userId

        await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username : username + "-user",
            password,
        })

        userToken = response.data.token

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6uo4GUNUV28mFZF0GZSQ7NDQPH1koGc-Urw&s",
            "width": 1,
            "height": 1,
            "static" : true
        }, {
            headers : {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6uo4GUNUV28mFZF0GZSQ7NDQPH1koGc-Urw&s",
            "width": 1,
            "height": 1,
            "static" : true
        }, {
            headers : {
                Authorization: `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail" : "https://media.istockphoto.com/id/922427928/vector/top-view-of-the-countryside.jpg?s=612x612&w=0&k=20&c=m_VAVgHzH4E1IWb0JMvQxiUXZa8ZLUuLhsw237fRKfI=",
            "dimensions" : "100x200",
            "defaultElements" :  [{
                elementId: element1Id,
                x:20,
                y:20
            }, {
                elementId: element1Id,
                x:18,
                y:20
            }, {
                elementId: element2Id,
                x:19,
                y:21,
            }]
        }, {
            headers: {
                "Authorization" : `Bearer ${adminToken}`
            }
        })
        mapId = mapResponse.data.id

    })

    test("User is able to create a space", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
            "dimensions" : "100x200",
            "mapId" : mapId
        }, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })
        expect(response.spaceId).toBeDefined()
    })

    test("User is able to create a space without mapId", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
            "dimensions" : "100x200",
        }, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })
        expect(response.spaceId).toBeDefined()
    })

    test("User is  not able to create a space without mapId || dimensions", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
        } , {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })
        expect(response.statusCode).toBe(400)
    })

    test("User is not able to delete a space that doesnt exist", async () => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/${randomId}`, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })
        expect(response.statusCode).toBe(400)
    })

    test("User is able to delete a space that exist", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
            "dimensions" : "100x200",
            "mapId" : mapId
        }, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        const updatedResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })
        expect(response.statusCode).toBe(200)
    })

    test("user should not be able to delete other spaces" , async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
            "dimensions" : "100x200",
        } , {
            header : {
                Authorization : `Bearer ${adminToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}` , {
            header: {
                Authorization : `Bearer ${adminToken}`
            }
        })
        expect(deleteResponse.statusCode).toBe(400)
    })

    test("admin has no spaces initally" , async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            header: {
                Authorization : `Bearer ${userToken}`
            }
        })
        expect(response.data.spaces.length).toBe(0)
    })

    test("admin has no spaces initally and hence are created" , async () => {
        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
            "dimensions" : "100x200",
        }, {
            header: {
                Authorization : `Bearer ${userToken}`
            }
        })
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            header: {
                Authorization : `Bearer ${userToken}`
            }
        })
        const filteredSpaces = response.data.space.find(x => x.id == spaceCreateResponse.spaceId)
        expect(response.data.spaces.length).toBe(0)
        expect(filteredSpaces).toBeDefined()
    })

})

describe("Arena Endpoint", () => {
    let mapId ;
    let element1Id;
    let element2Id;
    let adminToken;
    let userToken;
    let userId;
    let adminId;
    let spaceId;

    beforeAll( async () => {
        const username = "demo" + Math.random();
        const password = "123456";

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username,
            password,
            type: "admin"
        })

        adminId = signUpResponse.data.userId

        await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username,
            password,
        })

        adminToken = response.data.token

        const userSignUpResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username : username + "-user",
            password,
            type: "user"
        })

        userId = userSignUpResponse.data.userId

        const userSignInResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username : username + "-user",
            password,
        })

        userToken = userSignInResponse.data.token

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6uo4GUNUV28mFZF0GZSQ7NDQPH1koGc-Urw&s",
            "width": 1,
            "height": 1,
            "static" : true
        }, {
            headers : {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6uo4GUNUV28mFZF0GZSQ7NDQPH1koGc-Urw&s",
            "width": 1,
            "height": 1,
            "static" : true
        }, {
            headers : {
                Authorization: `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail" : "https://media.istockphoto.com/id/922427928/vector/top-view-of-the-countryside.jpg?s=612x612&w=0&k=20&c=m_VAVgHzH4E1IWb0JMvQxiUXZa8ZLUuLhsw237fRKfI=",
            "dimensions" : "100x200",
            "defaultElements" :  [{
                elementId: element1Id,
                x:20,
                y:20
            }, {
                elementId: element1Id,
                x:18,
                y:20
            }, {
                elementId: element2Id,
                x:19,
                y:21,
            }]
        }, {
            headers: {
                "Authorization" : `Bearer ${adminToken}`
            }
        })
        mapId = mapResponse.data.id

        const spaceResponse = axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
            "dimensions" : "100x200",
            "mapId" : mapId
        }, {
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })
        
        spaceId = spaceResponse.data.spaceId
    })

    test("Incorect spaceID returns a 400", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/123demo`, {
            headers: {
                Authorization : `Bearer ${userToken}`
            }
        });
        expect(response.statusCode).toBe(400);
    })

    test("Incorect spaceID returns a 400", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}` ,{
            headers: {
                Authorization : `Bearer ${userToken}`
            }
        });
        expect(response.data.dimensions).toBe("100x200");
        expect(response.data.elements.length).toBe(3);
    })

    test("Correct spaceId returns all the elements" ,async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}` , {
            headers: {
                Authorization : `Bearer ${userToken}`
            }
        });
        expect(response.data.dimensions).toBe("100x200")
        expect(response.data.elements.length).toBe(3)
    })

    test("deletes the elements in space" ,async () => {
        const elementResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}` , {
            headers: {
                Authorization : `Bearer ${userToken}`
            }
        });
        const spaceResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            spaceId: spaceId,
            elementId : elementResponse.data.elements[0].id
        } ,  {
            headers: {
                Authorization : `Bearer ${userToken}`
            }
        });
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}` ,  {
            headers: {
                Authorization : `Bearer ${userToken}`
            }
        })
        expect(response.data.elements.length).toBe(2)
    })

    test("Adding an element in the space" ,async () => {

        const newElement = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId" : element1Id,
            "spaceId" : elementResponse,
            "x" : "17",
            "y" : "20"        
         } ,  {
            headers: {
                Authorization : `Bearer ${userToken}`
            }
        });
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                Authorization : `Bearer ${userToken}`
            }
        })
        expect(response.data.elements.length).toBe(3)
    })

    test("Adding an element in the space fails if element lies outisde the dimensions" ,async () => {

        const newElement = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId" : element1Id,
            "spaceId" : elementResponse,
            "x" : "171211",
            "y" : "203213"        
        },  {
            headers: {
                Authorization : `Bearer ${userToken}`
            }
        });
        expect(newElement.statusCode).toBe(400)
    })

})

describe("Admin endpoints", () => {
    let adminToken;
    let userToken;
    let userId;
    let adminId;

    beforeAll( async () => {
        const username = "demo" + Math.random();
        const password = "123456";

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username,
            password,
            type: "admin"
        })

        adminId = signUpResponse.data.userId

        await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username,
            password,
        })

        adminToken = response.data.token

        const userSignUpResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username : username + "-user",
            password,
            type: "user"
        })

        userId = userSignUpResponse.data.userId

        const userSignInResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
            username : username + "-user",
            password,
        })

        userToken = userSignInResponse.data.token
    })

    test("User is not able to hit admin endpoints", async () => {
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6uo4GUNUV28mFZF0GZSQ7NDQPH1koGc-Urw&s",
            "width": 1,
            "height": 1,
            "static" : true
        }, {
            headers : {
                "Authorization": `Bearer ${userToken}`
            }
        })

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail" : "https://media.istockphoto.com/id/922427928/vector/top-view-of-the-countryside.jpg?s=612x612&w=0&k=20&c=m_VAVgHzH4E1IWb0JMvQxiUXZa8ZLUuLhsw237fRKfI=",
            "dimensions" : "100x200",
            "defaultElements" :  [{}]
        }, {
            headers: {
                "Authorization" : `Bearer ${userToken}`
            }
        })

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl" : "https://w7.pngwing.com/pngs/993/275/png-transparent-pixel-art-meme-avatar-others-culture-meme-fictional-character-thumbnail.png",
            "name" : "Tiny"
        }, {
            headers: {
                "Authorization" : `Bearer ${userToken}`
            }
        })                

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl" : "https://w7.pngwing.com/pngs/993/275/png-transparent-pixel-art-meme-avatar-others-culture-meme-fictional-character-thumbnail.png",
            "name" : "Tiny"
        }, {
            headers: {
                "Authorization" : `Bearer ${userToken}`
            }
        })

        expect(element1Response.statusCode).toBe(403)
        expect(mapResponse.statusCode).toBe(403)
        expect(avatarResponse.statusCode).toBe(403)
        expect(updateElementResponse.statusCode).toBe(403)
    })

    test("Admin is able to hit admin endpoints", async () => {
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6uo4GUNUV28mFZF0GZSQ7NDQPH1koGc-Urw&s",
            "width": 1,
            "height": 1,
            "static" : true
        }, {
            headers : {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail" : "https://media.istockphoto.com/id/922427928/vector/top-view-of-the-countryside.jpg?s=612x612&w=0&k=20&c=m_VAVgHzH4E1IWb0JMvQxiUXZa8ZLUuLhsw237fRKfI=",
            "dimensions" : "100x200",
            "defaultElements" :  [{}]
        }, {
            headers: {
                "Authorization" : `Bearer ${adminToken}`
            }
        })

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl" : "https://w7.pngwing.com/pngs/993/275/png-transparent-pixel-art-meme-avatar-others-culture-meme-fictional-character-thumbnail.png",
            "name" : "Tiny"
        }, {
            headers: {
                "Authorization" : `Bearer ${adminToken}`
            }
        })                

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl" : "https://w7.pngwing.com/pngs/993/275/png-transparent-pixel-art-meme-avatar-others-culture-meme-fictional-character-thumbnail.png",
            "name" : "Tiny"
        }, {
            headers: {
                "Authorization" : `Bearer ${adminToken}`
            }
        })

        expect(element1Response.statusCode).toBe(200)
        expect(mapResponse.statusCode).toBe(200)
        expect(avatarResponse.statusCode).toBe(200)
    })

    test("Admin is able to update the space imageUrl for an element", async () => {

        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl" : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6uo4GUNUV28mFZF0GZSQ7NDQPH1koGc-Urw&s",
            "width" : "1",
            "height" : "1",
            "static" : "true"
        }, {
            headers : {
                "Authorization" : `Bearer ${adminToken}`
            }
        })

        const updateElementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`, {
            "imageUrl" : "https://w7.pngwing.com/pngs/993/275/png-transparent-pixel-art-meme-avatar-others-culture-meme-fictional-character-thumbnail.png",
        }, {
            headers: {
                "Authorization" : `Bearer ${adminToken}`
            }
        })

        expect(updateElementResponse.statusCoded).toBe(200)
    })
})

describe("Websockets test", () => {
    //toBe
})