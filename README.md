# e-Cognita Server

## REST API

### Authentication

The server uses basic authentication. 
With each request you have to send an authentication header:

Example:
```http
Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==
```

### Register user
Registers a user

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

### Get all courses
Gets list of all available courses

**Request:**
```httph
GET /api/courses/
```

**Response:**
```httph
Status:
200 OK
```

### Get course
Gets a course by id

**Request:**
```httph
GET /api/courses/:id
```

**Response:**
```httph
Status:
200 OK
```

### Get authored courses
Get list of courses which the authenticated user is the author for.

**Request:**
```httph  
GET /api/account/authored  
Accept: application/json 
```

**Response:**
```httph
Status:
200 OK
```

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

### Enroll for a course
Enroll for a course

**Request:**
```httph
POST /api/account/enrolled/:id

params:  
id       Course ID for which the user is enrolling    
```

**Response:**
```httph
Status:
204 No Content      - Successfully enrolled
400 Bad Request     - Course not found
```

### Get enrolled courses
Get list of courses which the user is enrolled for.

**Request:**
```httph
GET /api/account/enrolled
Accept: application/json  
```

**Response:**
```httph
Status:
200 OK
```

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

### Leave a course
Leave a course

**Request:**
```httph
DELETE /api/account/enrolled/:id

params:  
id       required    (ID of the course to be left)
```

**Response:**
```httph
Status:
204 No Content      - Successfully left the course
404 Not Found       - Course not found in user's enrollments or user is already enrolled in that course.
```

### Create new quiz

**Request:**
```httph
POST /api/quizzes
Content-Type: application/json
```

**Request Body Example:**
```json
{
    "title": "Server Technologies",
    "description": "Show your skills and knowledge!",
    "course_id": "5576ee13170cb4cc2abb8ed2", 
    "questions": [
        {
            "question": "First question?",
            "choices": ["Answ1",  "Answ2"],
            "correct": "1"
        },
         {
            "question": "Another quesion?",
            "choices": ["Answ3", "Answ4"],
            "correct": "0"
        } 
    ]
}
```

**Response:**

```httph
Status:
201 Created         - Quiz successfully created.
400 Bad Request     - Invalid or missing parameters.
```

### Get quiz

**Request:**
```httph
GET /api/quizzes/:id
Accept: application/json
```

**Response:**
```httph
Status:
200 OK
```

**Response Content Example:**
```json
{
    "id": "5576f3aff5d8953417ce1824",
    "created": "2015-06-09T14:09:51.989Z",
    "course_id": "5576ee13170cb4cc2abb8ed2",
    "title": "Server Technologies",
    "description": "Show your skills and knowledge!"
}
```

### Get all course quizzes
Gets all quizzes which are associated to the given course ID.

**Request:**
```httph
GET /api/quizzes
Content-Type: application/json

query parameters:
course_id   
```

**Response:**
```httph
Status:
200 OK
```

**Response Content Example:**
```json
[
    {
        "id": "5576f3aff5d8953417ce1824",
        "created": "2015-06-09T14:09:51.989Z",
        "course_id": "5576ee13170cb4cc2abb8ed2",
        "title": "Server Technologies",
        "description": "Show your skills and knowledge!"
    }
]
```

### Get quiz questions
**Request:**
```httph
GET /api/quizzes/:id/questions
Content-Type: application/json
```

**Response:**
```httph
Status:
200 OK
```

```json
[
    {
        "id": "5576f3aff5d8953417ce1826",
        "question": "First question?",
        "choices": [
            "Answ1",
            "Answ2"
        ]
    },
    {
        "id": "5576f3aff5d8953417ce1825",
        "question": "Another quesion?",
        "choices": [
            "Answ3",
            "Answ4"
        ]
    }
]
```

### Publish Quiz
Publishes a quiz and notifies all subscribed users.

**Request:**

```httph
POST /api/quizzes/:id/publish
Content-Type: x-www-form-urlencoded

form-data:  
text        required    (Text message to the subscribers)  
```

**Response:**

```httph 
Status:
200 OK                 - Quiz successfully published.
503 Service Unavailable     - No subscribers notified.
```


### Subscribe user for receiving notifications
Subscribes a user to receive push notifications

**Request:**

```httph
POST /api/account/subscriptions/:token

params:  
token   (Push notification token)  
```

**Response:**

```httph 
Status:
204 No Content      - Account successfully subscribed.
```

### Unsubscribe user for receiving notifications
Unubscribes a user to receive push notifications

**Request:**

```httph
DELETE /api/account/subscriptions/
```

**Response:**

```httph 
Status:
204 No Content      - Account successfully unsubscribed.
```


### Send answers
```httph
POST /api/quizzes/:id/solutions
```

**Example Request Body**
```json
[
  {
      "question": "55776494d01118ec0cfdfc0f",
      "selected":1
  },
  {
      "question": "66776494d01118ec0cfdfc0f",
      "selected":0
  }
]
```

**Response:**

```httph 
Status:
204 No Content      - Answers successfully sent.
```

### Get quiz solution
```httph
GET /api/quizzes/:id/solutions
```

```json
[
    {
        "question": "Question 1",
        "choices": [
            "answer1",
            "answer 3",
            "answer 2"
        ],
        "correct": 3,
        "selected": 0
    },
    {
        "question": "Question 2",
        "choices": [
            "answer 3",
            "answer 4"
        ],
        "correct": 2,
        "selected": null
    }
]
```