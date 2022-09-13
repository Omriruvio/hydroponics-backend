
# Hydroponics Network - Backend

User data management system for Hydroponics Network.

Users submit crop related data for their hydroponic crops such as temperature, electric conductivity, ph, and raw images of their crops via Whatsapp and receive AI based feedback for improving their crop's health.

Data representation is also available via user and admin dashboards.


## Installation

** Environment variables must be set prior to deployment **

To install this project run


```bash
  git clone https://github.com/Omriruvio/hydroponics-backend.git
```
```bash
  cd hydroponics-backend
  npm install
```
    
## Deployment
- Requires backend deployment - see here: https://github.com/Omriruvio/hydroponics-backend
- Requires mongoDB to be installed on the deployment OS
- Requires environment variables to be set up

#### Local/dev deployment:
```bash
  npm install
  npm run dev  
```

#### Server deployment:
```bash
  npm install
  node server.js
```

The server will be avilable http://localhost:3000 (by default)


## Tech Stack

**Client:** NextJS, React, Styled Components

**Server:** Node, Express, MongoDB, Twilio


## Environment Variables

To run this project, you will need to add the following environment variables to your .env.local file

`NODE_ENV` - 'DEV' / 'production'

`PORT` - Desired port for server

`TWILIO_SID` - Twilio SID

`TWILIO_AUTH_TOKEN` - Twilio auth token

`MONGODB_URI` - MongoDB URI

`HYDROPONICS_WA_NUMBER` - Approved whatsapp business number

`CLOUDINARY_CLOUD_NAME` - From Cloudinary

`CLOUDINARY_API_KEY` - From Cloudinary

`CLOUDINARY_API_SECRET` - From Cloudinary

`JWT_SECRET` - Secret key for JWT encryption
## Author - contact

- [Github - Omri Ruvio](https://www.github.com/omriruvio)
- [Twitter - @omriruvio](https://twitter.com/omriruvio)
- [LinkedIn](www.linkedin.com/in/omri-ruvio)


## Running Tests

To run tests, run the following command

```bash
  npm run test
```
