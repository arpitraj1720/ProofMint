# ProofMint Backend API Documentation

## Base URL

```
http://localhost:3001
```

---

# Upload Image

## Endpoint

```
POST /api/images
```

---

## Content Type

```
multipart/form-data
```

---

## Required File

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| image | File | ✅ Yes | Image to upload |

---

## Required Text Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| owner | String | ✅ Yes | User's wallet address |

---

## Current Success Response

Status Code:

```
201 Created
```

Example:

```json
{
    "success": true,
    "message": "Image saved successfully",
    "image": {
        "_id": "...",
        "owner": "0x123...",
        "hash": "...",
        "imageUrl": "...",
        "aiLabel": "...",
        "aiConfidence": 0.97
    }
}
```

---

## Current Error Response

Duplicate Image

Status Code:

```
409 Conflict
```

Example:

```json
{
    "success": false,
    "message": "This image has already been uploaded."
}
```