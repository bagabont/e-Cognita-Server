# e-Cognita-Server

## API Overview

### Create user

**Request:**
```httph
POST /api/users
x-www-form-urlencoded
```
parameters:

email       required    (valid email)
pass        required    (min 3 chars)
fistname    required    (min 1 char)
lastname    optional


**Response:**

```httph
Status:
201 Created - User successfully created
409 Conflict - User already exists.
```