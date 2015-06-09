# e-Cognita Server

## API Overview

### Create user

**Request:**
```httph
POST /api/users
Content-Type: x-www-form-urlencoded

parameters:  
email       required    (valid email)  
password    required    (min 3 chars)  
fistname    required    (min 1 char)  
lastname    optional  
```

**Response:**

```httph
Status:
201 Created - User successfully created
409 Conflict - User already exists.
```

### Get user courses

**Request:**
```httph
GET /api/user/courses  
Accept: application/json  

parameters:   
type    optional    (owned, subscribed)   
```

**Response:**

```httph

```

### Create new course

**Request:**
```httph
POST /api/courses
Content-Type: x-www-form-urlencoded

parameters:  
title           required, unique    (min 1 char)  
description     required            (min 1 chars)  
```

**Response:**

```httph
Status:
201 Created     - Course successfully created
409 Conflict    - Course already exists.
```

### Create new quiz

**Request:**
```httph
POST /api/courses/:id/quizzes
Content-Type: application/json

**Response:**

```httph
Status:
201 Created     - Course successfully created.
204 No Content  - Course successfully modified.
409 Conflict    - Course already exists.
```

### Get quiz
**Request:**
```httph
POST /api/courses/:id/quizzes/:qid
Content-Type: application/json

**Response:**

```httph
Status:
201 Created     - Course successfully created.
204 No Content  - Course successfully modified.
409 Conflict    - Course already exists.
```
