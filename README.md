# BFP Sorsogon Face Recognition Attendance System (Modernized)

<p align="center">
  <img src="frontend/assets/images/bfp-logo.png" alt="BFP Logo" width="200"/>
</p>

## Introduction

The BFP Sorsogon Face Recognition Attendance System (Modernized) is a web application that automates attendance tracking for the Bureau of Fire Protection using facial recognition technology. This version features a modern split architecture with a RESTful API backend and a component-based frontend for improved maintainability and scalability.

The application follows a clean architecture with clear separation of concerns:

- **Backend**: Flask-based RESTful API with SQLAlchemy ORM
- **Frontend**: Modern JavaScript using component pattern
- **Face Recognition**: YOLO-based face detection with embedding models
- **Authentication**: JWT-based token authentication
- **UI**: Responsive design with Tailwind CSS

## Architecture Overview

This modernized system uses a split architecture approach:

1. **Backend**: Flask-based RESTful API that handles data processing, authentication, and business logic
2. **Frontend**: Component-based JavaScript application that handles UI rendering and user interactions

This separation provides several advantages:

- Independent scaling of frontend and backend
- Clear API contracts between systems
- Separation of concerns for easier maintenance
- Better testability of individual components

## Code Structure

```
BFPSorsuAttendance_Modern/
├── backend/                    # API Server
│   ├── app/                    # Application package
│   │   ├── api/                # API endpoints
│   │   ├── models/             # Database models
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Helper utilities
│   │   └── __init__.py         # App initialization
│   └── run.py                  # Server entry point
├── frontend/                   # Client Application
│   ├── assets/                 # Static assets
│   │   ├── css/                # Stylesheets
│   │   ├── images/             # Image resources
│   │   └── js/                 # JavaScript files
│   │       ├── components/     # UI Components
│   │       └── services/       # API Services
│   └── index.html              # Main HTML entry point
├── face_data/                  # Face recognition data
└── README.md                   # This documentation
```

## Backend (Flask API)

The backend follows a RESTful API design with proper resource organization and consistent error handling.

### Key Components

#### 1. API Endpoints (`backend/app/api/`)

The API endpoints are organized by resource type:

- **auth.py**: Authentication endpoints (login, logout, token refresh)
- **personnel.py**: Personnel management endpoints
- **attendance.py**: Attendance recording and history
- **face.py**: Face recognition and registration

Example endpoint structure:

```python
# backend/app/api/face.py
class FaceRecognitionResource(Resource):
    """Resource for face recognition."""

    def post(self):
        """
        Recognize a face from an image.

        Returns:
            dict: Response with personnel data and confidence score
        """
        try:
            # Implementation details
            # ...
            return {
                "success": True,
                "personnel": personnel_data,
                "confidence": confidence,
            }, 200

        except AppError as e:
            return e.to_dict(), 400

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "error_code": ErrorCode.SYSTEM_UNKNOWN_ERROR.value
            }, 500
```

#### 2. Models (`backend/app/models/`)

Database models using SQLAlchemy ORM:

- **user.py**: User model for authentication and authorization
- **personnel.py**: Personnel information
- **attendance.py**: Attendance records
- **face_data.py**: Face recognition data
- **activity_log.py**: System activity logging

Models include relationships, validation, and helper methods:

```python
# backend/app/models/personnel.py
class Personnel(BaseModel, ModelMethods):
    """Personnel model representing fire station staff."""

    __tablename__ = "personnel"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    rank = db.Column(db.String(50), nullable=False)
    station_id = db.Column(db.Integer, db.ForeignKey("station.id"), nullable=False)

    # Relationships
    station = db.relationship("Station", backref="personnel")
    face_data = db.relationship("FaceData", backref="personnel", uselist=False)

    @property
    def full_name(self):
        """Get the personnel's full name."""
        return f"{self.first_name} {self.last_name}"

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
            "rank": self.rank,
            "station_id": self.station_id,
            "has_face_data": self.face_data is not None
        }
```

#### 3. Services (`backend/app/services/`)

The services layer contains business logic separate from API handling:

- **face_recognition/**: Face detection and recognition algorithms
- **attendance_service.py**: Attendance processing logic
- **notification_service.py**: Email and system notifications

```python
# backend/app/services/face_recognition/__init__.py
def recognize_face(face_embedding, face_database, confidence_threshold=0.6):
    """
    Compare a face embedding against the database.

    Args:
        face_embedding: The embedding vector to compare
        face_database: Dictionary of stored embeddings
        confidence_threshold: Minimum similarity score (0-1)

    Returns:
        tuple: (personnel_id, confidence) or (None, 0) if no match
    """
    # Implementation details
    # ...
```

#### 4. Utils (`backend/app/utils/`)

Utility modules that support the application:

- **errors.py**: Error handling classes and error codes
- **security.py**: Security-related functions
- **validators.py**: Input validation helpers
- **logger.py**: Logging configuration

```python
# backend/app/utils/errors.py
class ErrorCode(Enum):
    """Error codes for the API."""

    # Authentication errors: 1000-1999
    AUTH_INVALID_CREDENTIALS = 1001
    AUTH_TOKEN_EXPIRED = 1002

    # Face Recognition errors: 2000-2999
    FACE_NOT_DETECTED = 2001
    FACE_LOW_CONFIDENCE = 2002

    # System errors: 9000-9999
    SYSTEM_DATABASE_ERROR = 9001
    SYSTEM_FILE_ERROR = 9002

class AppError(Exception):
    """Application-specific error with code and message."""

    def __init__(self, message, code=ErrorCode.SYSTEM_UNKNOWN_ERROR):
        self.message = message
        self.code = code
        super().__init__(self.message)

    def to_dict(self):
        """Convert to API response format."""
        return {
            "success": False,
            "error": self.message,
            "error_code": self.code.value,
        }
```

## Frontend (Component-Based JavaScript)

The frontend uses a component-based architecture for better organization and reusability.

### Key Components

#### 1. Core Application Files

- **index.html**: Main HTML entry point
- **assets/js/app.js**: Application initialization
- **assets/js/router.js**: Client-side routing
- **assets/js/config.js**: Application configuration
- **assets/js/ui-manager.js**: UI state management
- **assets/js/event-bus.js**: Event communication

The application initialization:

```javascript
// frontend/assets/js/app.js
class App {
  constructor() {
    this.config = new Config();
    this.router = new Router();
    this.uiManager = new UIManager();
    this.eventBus = new EventBus();

    // Initialize services
    this.services = {
      auth: new AuthService(),
      api: new ApiService(),
      personnel: new PersonnelService(),
      attendance: new AttendanceService(),
      faceRecognition: new FaceRecognitionService(),
      notification: new NotificationService(),
      user: new UserService(),
      settings: new SettingsService(),
    };

    this.initialize();
  }

  async initialize() {
    // Initialize application components
    // ...
  }
}
```

#### 2. Services (`frontend/assets/js/services/`)

Services handle API communication and business logic:

- **api-service.js**: Base API communication
- **auth-service.js**: Authentication and token management
- **personnel-service.js**: Personnel data operations
- **attendance-service.js**: Attendance recording and history
- **face-recognition-service.js**: Face recognition operations

Example service implementation:

```javascript
// frontend/assets/js/services/auth-service.js
class AuthService {
  constructor() {
    this.api = new ApiService();
    this.tokenKey = "auth_token";
    this.refreshTokenKey = "refresh_token";
    this.userKey = "user_data";
  }

  async login(email, password) {
    try {
      const response = await this.api.post("/api/v1/auth/login", {
        email,
        password,
      });

      if (response.success) {
        this.setTokens(
          response.access_token,
          response.refresh_token,
          response.user
        );
        return response;
      }

      return { success: false, error: response.error };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  }

  // Additional methods: logout, refreshToken, etc.
}
```

#### 3. UI Components (`frontend/assets/js/components/`)

Components handle UI rendering and user interactions:

- **login.component.js**: Login form and authentication
- **dashboard.component.js**: Main dashboard view
- **attendance.component.js**: Attendance recording interface
- **personnel.component.js**: Personnel management
- **settings.component.js**: Application settings
- **reports.component.js**: Attendance reports and charts
- **user-profile.component.js**: User profile management
- **not-found.component.js**: 404 page
- **error-boundary.component.js**: Error handling wrapper
- **loading.component.js**: Loading indicators
- **toast.component.js**: Notification toasts

Example component structure:

```javascript
// frontend/assets/js/components/attendance.component.js
export class AttendanceComponent {
  constructor(options = {}) {
    this.options = {
      outlet: null,
      params: {},
      ...options,
    };

    this.outlet = this.options.outlet;
    this.state = {
      mode: "camera", // 'camera' or 'manual'
      isProcessing: false,
      lastResult: null,
      // Additional state properties
    };

    this.initialize();
  }

  async initialize() {
    try {
      await this.setup();
      this.render();
      this.attachEventListeners();
    } catch (error) {
      console.error("Failed to initialize AttendanceComponent:", error);
      this.renderError(error);
    }
  }

  // Component lifecycle methods: render, attachEventListeners, destroy
  // Business logic methods: recordAttendance, processFaceRecognition, etc.
}
```

## Authentication Flow

The system uses JWT-based authentication:

1. **Login Process**:

   - User enters credentials in login form
   - Frontend sends request to `/api/v1/auth/login`
   - Backend validates credentials and generates access/refresh tokens
   - Frontend stores tokens in localStorage
   - User is redirected to dashboard

2. **Token Refresh**:

   - When access token expires, frontend uses refresh token
   - Backend validates refresh token and issues new access token
   - Frontend updates stored token

3. **Logout Process**:
   - User clicks logout
   - Frontend sends request to `/api/v1/auth/logout`
   - Backend adds token to blocklist
   - Frontend clears tokens from localStorage
   - User is redirected to login page

## Face Recognition Flow

The face recognition process follows these steps:

1. **Capture**: Frontend captures frames from webcam
2. **Detection**: Backend detects faces in the image
3. **Extraction**: Backend extracts facial features
4. **Matching**: Backend compares against stored embeddings
5. **Verification**: Backend returns match results
6. **Recording**: System records attendance based on match

```
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐
│ Capture │ -> │ Detection │ -> │ Extraction│ -> │ Matching │
└─────────┘    └──────────┘    └───────────┘    └──────────┘
                                                      |
┌───────────┐    ┌─────────────┐                      v
│ Recording │ <- │ Verification │ <- ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
└───────────┘    └─────────────┘
```

## Attendance Recording Flow

1. **User Initiates Attendance Recording**:

   - User navigates to attendance page
   - Frontend component initializes webcam
   - Camera captures frames at regular intervals

2. **Face Detection and Recognition**:

   - Frontend sends frames to backend API
   - Backend processes frame through face recognition pipeline
   - Backend identifies personnel and confidence score
   - Result returned to frontend

3. **Attendance Record Creation**:
   - System determines if time-in or time-out based on existing records
   - Creates attendance record with timestamp and verification image
   - Updates personnel status
   - Frontend displays confirmation with personnel details

## API Endpoints

### Authentication Endpoints

| Endpoint               | Method | Description                              |
| ---------------------- | ------ | ---------------------------------------- |
| `/api/v1/auth/login`   | POST   | Authenticate user and receive tokens     |
| `/api/v1/auth/logout`  | POST   | Invalidate current token                 |
| `/api/v1/auth/refresh` | POST   | Refresh access token using refresh token |

### Personnel Endpoints

| Endpoint                 | Method | Description                    |
| ------------------------ | ------ | ------------------------------ |
| `/api/v1/personnel`      | GET    | List all personnel             |
| `/api/v1/personnel`      | POST   | Create new personnel           |
| `/api/v1/personnel/<id>` | GET    | Get specific personnel details |
| `/api/v1/personnel/<id>` | PUT    | Update personnel information   |
| `/api/v1/personnel/<id>` | DELETE | Remove personnel               |

### Attendance Endpoints

| Endpoint                     | Method | Description                            |
| ---------------------------- | ------ | -------------------------------------- |
| `/api/v1/attendance`         | POST   | Record attendance via face recognition |
| `/api/v1/attendance`         | PUT    | Record manual attendance               |
| `/api/v1/attendance/history` | GET    | Get attendance history                 |
| `/api/v1/attendance/pending` | GET    | List pending attendance approvals      |
| `/api/v1/attendance/pending` | POST   | Approve/reject pending attendance      |

### Face Recognition Endpoints

| Endpoint                 | Method | Description                        |
| ------------------------ | ------ | ---------------------------------- |
| `/api/v1/face/recognize` | POST   | Recognize face in provided image   |
| `/api/v1/face/register`  | POST   | Register face images for personnel |

## Frontend Components

### Core Components

| Component              | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `LoginComponent`       | Handles user authentication                        |
| `DashboardComponent`   | Main dashboard with statistics and recent activity |
| `AttendanceComponent`  | Face recognition attendance interface              |
| `PersonnelComponent`   | Personnel management interface                     |
| `UserProfileComponent` | User profile management                            |
| `SettingsComponent`    | Application settings                               |
| `ReportsComponent`     | Attendance reports and analytics                   |

### Utility Components

| Component                | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `NotFoundComponent`      | 404 page for invalid routes                      |
| `ErrorBoundaryComponent` | Catches and displays component errors            |
| `LoadingComponent`       | Loading indicators (spinner, skeleton, progress) |
| `ToastComponent`         | Notification system                              |

## Event Communication

Components communicate through an event bus system:

```javascript
// frontend/assets/js/event-bus.js
class EventBus {
  constructor() {
    this.events = {};
  }

  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(
        (cb) => cb !== callback
      );
    }
  }

  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((callback) => callback(data));
    }
  }
}
```

Example usage:

```javascript
// Subscribe to event
const unsubscribe = app.eventBus.on("attendance:recorded", (data) => {
  console.log("New attendance recorded:", data);
  updateUI(data);
});

// Emit event
app.eventBus.emit("attendance:recorded", {
  personnel: { id: 1, name: "John Doe" },
  timestamp: new Date(),
  type: "Time In",
});

// Unsubscribe when component is destroyed
unsubscribe();
```

## Error Handling

The system implements a comprehensive error handling approach:

### Backend Error Handling

```python
# backend/app/utils/errors.py
class AppError(Exception):
    """Application-specific error with code and message."""

    def __init__(self, message, code=ErrorCode.SYSTEM_UNKNOWN_ERROR):
        self.message = message
        self.code = code
        super().__init__(self.message)

    def to_dict(self):
        """Convert to API response format."""
        return {
            "success": False,
            "error": self.message,
            "error_code": self.code.value,
        }
```

### Frontend Error Handling

```javascript
// frontend/assets/js/components/error-boundary.component.js
export class ErrorBoundaryComponent {
  constructor(options = {}) {
    this.options = {
      outlet: null,
      childComponent: null,
      childOptions: {},
      ...options,
    };

    this.hasError = false;
    this.error = null;
    this.errorInfo = null;

    this.initialize();
  }

  handleError(error, errorInfo = {}) {
    this.hasError = true;
    this.error = error;
    this.errorInfo = errorInfo;

    console.error("ErrorBoundary caught an error:", error);

    this.logErrorToServer(error, errorInfo);
    this.renderFallbackUI();
  }

  // Additional methods...
}
```

## Security Considerations

The system implements several security measures:

1. **Authentication**: JWT tokens with proper expiration and refresh
2. **Authorization**: Role-based access control with proper validation
3. **Input Validation**: Validation of all user inputs
4. **Error Handling**: Non-revealing error messages
5. **XSS Protection**: Proper encoding of user-generated content
6. **CSRF Protection**: Token-based protection for sensitive operations
7. **Secure Headers**: Proper HTTP security headers
8. **Audit Logging**: Activity logging for security events

## Performance Optimizations

The system includes several performance optimizations:

1. **Database Indexing**: Proper indexes on frequently queried columns
2. **Lazy Loading**: Components and resources loaded only when needed
3. **Caching**: Strategic caching of API responses and face data
4. **Compression**: Minimization of assets for production
5. **Efficient DOM Updates**: Targeted DOM updates instead of full page refreshes
6. **Throttling**: Rate limiting for intensive operations like face recognition

## Development and Deployment

### Development Setup

1. Backend setup:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python run.py
   ```

2. Frontend setup:
   ```bash
   cd frontend
   # Open index.html in a browser or use a simple HTTP server
   python -m http.server 8000
   ```

### Deployment Considerations

1. **Backend Deployment**:

   - Use WSGI server (Gunicorn, uWSGI) for production
   - Set up reverse proxy (Nginx, Apache)
   - Configure SSL/TLS for secure communication
   - Use environment variables for configuration

2. **Frontend Deployment**:
   - Minify and bundle JavaScript files
   - Configure CDN for static assets
   - Implement cache headers
   - Configure CORS properly

## Conclusion

The BFP Sorsogon Face Recognition Attendance System (Modernized) represents a significant improvement over the original monolithic application. By adopting a split architecture with a RESTful API backend and component-based frontend, the system achieves better:

- **Maintainability**: Clearer separation of concerns
- **Scalability**: Independent scaling of frontend and backend
- **Testability**: Easier testing of isolated components
- **Developer Experience**: Modern coding patterns and practices

The system provides a robust solution for attendance tracking with facial recognition while maintaining high standards for security, performance, and user experience.

---

<p align="center">
  <img src="frontend/assets/images/bfp-logo.png" alt="BFP Logo" width="100"/>
  <br>
  <i>Bureau of Fire Protection - Sorsogon City</i>
</p>
