# [DEPLOYED FRONTEND](https://tsns-front.herokuapp.com/) (once errors, **refresh the page**)
this error is caused by free dyno sleeping after 30 minutes

## Once you see the error message "application error," **refresh the page** to see the website
# tSNS

| Table of Contents   |
| ------------------- |
| [ERD](#erd)         |
| [SETUP](#setup)     |
| [API](#api)         |
| [REMARKS](#remarks) |

<br/>

[FRONTEND CODE](https://github.com/jjw2995/tsns-front)


### NOTE 2

this backend has code that is paired to my frontend so it will be unusable unless you change the urls sent to the users by these functions ( setupPassReset & sendVerificationEmail ) @ backend/services/service-auth.js

```js
  async setupPassReset(email) {
    let hash = crypto.randomBytes(20).toString("hex");
    let user = await this.User.findOneAndUpdate(
      { email: email },
      { resetPassHash: hash }
    );
    if (!user) {
      throw Error("user does not exist, register");
    }
    mailer.sendMail(
      email,
      "click the link below to reset password",
      // change below url
      `${process.env.FRONTEND_BASE_URL}/reset-password/${user._id}/${hash}`,
      "Click Me to Reset Password"
    );
    return;
  }

  function sendVerificationEmail(email, uid, vhash) {
    mailer.sendMail(
      email,
      "click the link below to verify",
      // change below url
      `${process.env.FRONTEND_BASE_URL}/${uid}/${vhash}`,
      "Click Me to Verify"
    );
  }
```

<a name="erd"/>

## simple ERD

**note - parent/child comment relationship is not recursive (only one level deep)**

![alt text](./simpleEntityRel.png)

<a name="setup"/>

## Backend Setup

environment variables

```
REFRESH_TOKEN_SECRET = private string to hash token
ACCESS_TOKEN_SECRET = private string to hash token

DB_URI = mongoDB instance uri (I used mongoDB Atlas)

EMAIL = email to send users email
EMAIL_PASSWORD = password of that email

BASE_URL = backend server base_url
FRONTEND_BASE_URL = frontend server base_url
```

**also don't forget**

```
google-credential.json
```

downloaded from google cloud storage and placed at the root (above folder backend)

## Start Server with

```
npm start
```

<a name="api"/>

## API

### [full API documentation](https://app.swaggerhub.com/apis/jjw2995/tSNS_API/1.0.0#/auth)

How to use simulated OAuth2 on my backend may be vague, so here's an example using Axios

```js
// after login, set header with given accessToken
let headers = {
  "Authorization": `Bearer ${your accessToken}`
  }

axios({headers}).get("/api/endpoints")
  .then(...)
  .catch(...)
```

if accessToken expires, request token refresh as following

```js
// refreshToken from login
let payload = {"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5..."}

axios().post("/api/token", payload)
  .then((r)=>{
    // returns new set of tokens if refreshToken is valid
    let {refreshToken, accessToken} = r
  })
  .catch(...)
```

<br/>

POST post request on API doc may be vague, so here's an example using Axios

```js
// example code of post post request using formdata, with Axios
let {level, description, images} = your input

let formData = new FormData();

formData.set("level", level);
formData.set("description", description);

// just set individual images to formdata with any name
images.forEach((r, i) => {
  formData.set(`${i}`, r);
});

let headers = {
  "Content-Type":"multipart/form-data",
  "Authorization": `Bearer ${your accessToken}`
  }

axios({headers}).post("/api/posts", formData)
  .then(...)
  .catch(...)
```

<a name="remarks"/>

## Ending Remarks

This first ever project took a while due to going in blind having no solid goals, concrete UI design, and minimum viable product.

While the backend code was initially developed agile & tested end to end, I stopped going agile when I started coding with frontend and tests are now out of date.

I'll come back to it later to update the tests and do minor API doc update but it has to suffice for now.

Doing this project, I've learned how to use docker (used for local mongoDB instance while dev), setup test environment, setup and use third party services like google cloud storage and deploy the final product.

Also learned that having concrete goals and Minimum Viable Product fast was important rather than agonizing over details of things with no code.


<!-- ## Authorization

| Status Code | Description             |
| :---------- | :---------------------- |
| 200         | `OK`                    |
| 201         | `CREATED`               |
| 400         | `BAD REQUEST`           |
| 404         | `NOT FOUND`             |
| 500         | `INTERNAL SERVER ERROR` | -->
