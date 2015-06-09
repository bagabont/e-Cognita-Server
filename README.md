# e-Cognita Server

## REST API

### Register user

**Request:**
```httph

POST /api/users
Content-Type: x-www-form-urlencoded

form-data:  
email       required    (valid email)  
password    required    (min 3 chars)  
fistname    required    (min 1 char)  
lastname    optional  

```

**Response:**

```httph 

Status:
201 Created     - User successfully created
409 Conflict    - User already exists.  

```


### Create new course
Creates a new course.

**Request:**
```httph
POST /api/courses
Content-Type: x-www-form-urlencoded

form-data:  
title           required, unique    (min 1 char)  
description     required            (min 1 chars)  

```

**Response:**

```httph

Status:
201 Created     - Course successfully created
409 Conflict    - Course already exists

```

### Get authored courses
Obtain list of courses which the authenticated user is the author for.

**Request:**
```httph

GET /api/courses/authored  
Accept: application/json 
 
```

**Response:**
```json

[
    {
        "id": "557696342886b96832a4842f",
        "title": "Some Title",
        "description": "Info about the course."
    },
    {
        "id": "5576a95fa68224581ff11da6",
        "title": "Another Title",
        "description": "Useful information."
    }
]

```

### Get enrolled courses
Obtain list of courses which the authenticated user is enrolled for.

**Request:**
```httph

GET /api/courses/enrolled  
Accept: application/json  

```

**Response:**
```json

[
    {
        "id": "557696342886b96832a4842f",
        "title": "Some Title",
        "description": "Info about the course."
    },
    {
        "id": "5576a95fa68224581ff11da6",
        "title": "Another Title",
        "description": "Useful information."
    }
]

```

### Create new quiz

**Request:**
```httph
POST /api/quizzes
Content-Type: application/json

query parameters:  

course_id   required    (ID of the course for which the quiz is created)

```

**Response:**

```httph

Status:
201 Created     - Quiz successfully created.
409 Conflict    - Quiz already exists.

```

### Get quiz
**Request:**
```httph
POST /api/quizzes/:id
Content-Type: application/json

**Response:**

```httph

//TODO

```
