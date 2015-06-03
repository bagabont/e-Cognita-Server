# e-Cognita-Server

## API Overview

### Create user
**Request:**
```httph
POST /api/users?email=<user-email>&pass=<user-pass>&fistname=<first-name>&lastname=<last-name>
```

**Response:**
```httph
Status:
201 Created - User successfully created
409 Conflict - User already exists.
```