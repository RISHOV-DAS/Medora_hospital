## 3. Hospital Authentication
**Route Base**: `/hospital`

### `POST /hospital/send-otp`
Initiates hospital registration or login.
* **Request Body (JSON)**:
  ```json
  {
    "phone": "+918240509018"
  }
  ```

### `POST /hospital/verify-otp`
Verifies OTP for a hospital. If the hospital doesn't exist, it creates one (registration).
* **Request Body (JSON)**:
  ```json
  {
    "phone": "+918240509018",
    "name": "Apollo Hospital",
    "address": "123 Health Street",
    "otp": "000000"
  }
  ```
* **Success Response (200 OK / 201 Created)**:
  ```json
  {
    "message": "Hospital authenticated successfully",
    "hospital": {
      "id": "uuid",
      "name": "Apollo Hospital",
      "phone": "+918240509018"
    },
    "token": "eyJhbGciOi..."
  }
  ```

### `POST /hospital/signout`
* **Headers**: `Authorization: Bearer <hospital_token>`

---

## 4. Hospital Management Endpoints
**Route Base**: `/hospital`
*(All routes here require `Authorization: Bearer <hospital_token>`)*

### `POST /hospital/patients/add`
Links an existing patient to this hospital via phone number.
* **Request Body (JSON)**:
  ```json
  { "phone": "+919876543210" }
  ```
* **Success Response (200 OK / 201 Created)**:
  ```json
  {
    "message": "Patient added to hospital",
    "patient": { "id": "uuid", "name": "John Doe", "phone": "+919876543210" }
  }
  ```

### `GET /hospital/patients`
Gets a list of all patients assigned to this hospital.
* **Success Response (200 OK)**:
  ```json
  {
    "total": 1,
    "patients": [
      {
         "id": "uuid",
         "name": "John Doe",
         "phone": "+919876543210",
         "joined_at": "2026-04-17T12:00:00Z"
      }
    ]
  }
  ```

### `DELETE /hospital/patients/:patient_id`
Unlinks a patient from the hospital completely.
* **Success Response (200 OK)**: `{ "message": "Patient removed successfully" }`

### `DELETE /hospital/patients/:patient_id/documents`
Permanently deletes all documents/records specific to this hospital for this patient.
* **Success Response (200 OK)**: `{ "message": "All documents for this patient deleted successfully" }`

### `POST /hospital/doctors/add`
Adds a doctor to the hospital. If they don't exist in Medora yet, it creates their account so they can sign in independently later.
* **Request Body (JSON)**:
  ```json
  {
    "name": "Dr. Smith",
    "phone": "+917551807558",
    "specialization": "Cardiology",
    "license_no": "DOC12345" // (Optional fallback)
  }
  ```
* **Success Response (200 OK / 201 Created)**:
  ```json
  {
    "doctor": {
      "id": "uuid",
      "name": "Dr. Smith",
      "phone": "+917551807558",
      "specialization": "Cardiology",
      "message": "Doctor already exists and has been successfully linked to the hospital."
    }
  }
  ```

### `GET /hospital/doctors`
Gets all doctors linked to this hospital.
* **Success Response (200 OK)**:
  ```json
  {
    "total": 1,
    "doctors": [
      { "id": "uuid", "name": "Dr. Smith", "phone": "+91...", "specialization": "Cardiology" }
    ]
  }
  ```

### `DELETE /hospital/doctors/:doctor_id`
Unlinks a doctor from the hospital.
* **Success Response (200 OK)**: `{ "message": "Doctor removed successfully" }`

### `POST /hospital/patients/:phone/records`
Allows a hospital receptionist or admin to upload a medical file for a patient directly to the hospital's view.
* **Headers**: `multipart/form-data`
  - `file`: (Binary File)
  - `visit_date`: *(Optional)* "2026-04-17" (Defaults to today)
* **Success Response (201 Created)**:
  ```json
  {
    "message": "Record uploaded successfully",
    "record": {
      "id": "uuid",
      "patient_name": "John Doe",
      "file_url": "https://...",
      "visit_date": "2026-04-17",
      "ai_summary": {} // Populated asynchronously
    }
  }
  ```

### `GET /hospital/info`
A **massive aggregate endpoint** pulling all doctors and all patients (including fully populated visit chronologies and AI summarized records) linked to the hospital.
* **Success Response (200 OK)**:
  ```json
  {
    "hospital": { "id": "uuid", "name": "Apollo Hospital" },
    "staff": [
       { "user_id": "uuid", "name": "Dr. Smith", "specialization": "Cardiology" }
    ],
    "patients": [
       {
         "user_id": "uuid",
         "name": "John Doe",
         "visits": [
           { 
              "date": "2026-04-17", 
               "records": [ { "id": "uuid", "file_url": "...", "ai_summary": {} } ] 
           }
         ]
       }
    ]
  }
  ```

--- 