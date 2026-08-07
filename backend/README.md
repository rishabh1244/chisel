
# Chisel

> Version control for physical infrastructure.

Chisel brings the principles of version control to the construction and infrastructure industry. Just as Git tracks every change made to software, Chisel maintains a transparent and auditable history of every modification made to physical assets throughout their lifecycle.

From construction projects and maintenance work to infrastructure repairs, Chisel provides a centralized workspace for tracking work, reviewing changes, and maintaining project history.

---
<img width="4695" height="3309" alt="image" src="https://github.com/user-attachments/assets/ae12df91-5b63-4cec-8f70-0feaa4e0487e" />

## What is Chisel?

In traditional construction workflows, project updates are often scattered across spreadsheets, images, reports, and messaging platforms. This makes it difficult to maintain accountability, verify completed work, and understand how a project has evolved over time.

Chisel solves this by treating every piece of work as a reviewable change that becomes a permanent part of a project's history.

Every modification follows a simple workflow:

```text
Issue Created
      ↓
Worker Completes Task
      ↓
Creates a Chisel
      ↓
Maintainer Reviews Changes
      ↓
Approved & Merged
      ↓
Added to Project History
```

---

## Features

- Infrastructure version control.
- Project timeline and change history.
- Issue tracking and task management.
- Worker and maintainer roles.
- Review and approval workflow for completed work.
- Blueprint upload and processing.
- Interactive 3D blueprint visualization.
- Auditable project history.
- Worker portfolios based on completed contributions.
- Real-time project transparency for stakeholders.

---

## Core Concepts

### Projects

A Project represents any physical asset or infrastructure being managed.

Examples:

- Residential Buildings
- Roads
- Bridges
- Schools
- Commercial Complexes
- Maintenance Projects

---

### Issues

Every piece of work begins as an Issue.

Examples:

- Complete electrical wiring.
- Paint the exterior walls.
- Repair water leakage.
- Perform structural inspection.
- Install plumbing.

Issues may be assigned to workers or created independently.

---

### Chisels

A Chisel is a reviewable record of completed work.

It contains:

- Description of completed work.
- Images and supporting media.
- Worker information.
- Timestamped progress updates.
- Verification metadata.

Maintainers can approve or reject submitted Chisels before they become part of the project's permanent history.

---

### Project History

Approved Chisels are merged into the project's timeline, creating a complete and immutable history of all modifications.

```text
Project Created

↓

Blueprint Uploaded

↓

Foundation Completed

↓

Electrical Wiring Completed

↓

Water Leakage Fixed

↓

Roof Installed

↓

Structural Inspection Passed
```

---

## Architecture

Chisel follows a Modular Monolith architecture.

```text
                Client
                   |
                   |
              API Gateway
                   |
------------------------------------------------

    Auth

    Users

    Projects

    Issues

    Chisels

    Blueprints

------------------------------------------------
                   |
                MongoDB
```

---

## Tech Stack

### Frontend

- React js 
- Tailwind CSS
- Three.js

### Backend

- Node.js
- Express.js
- JWT Authentication

### Database

- MongoDB Atlas

### AI & Visualization

- Gemini API
- Three.js
- Blueprint to JSON conversion pipeline

---

## Vision

Our goal is to make Chisel the standard version control platform for physical infrastructure.

Whether it's a small renovation project or a large-scale construction site, every modification should be transparent, reviewable, and permanently recorded.

Software engineers have Git.

Physical infrastructure deserves Chisel.

---

## Getting Started

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## License

MIT License.

---

## API Reference

### Authentication

All protected routes require a `Authorization: Bearer <token>` header. Obtain a token via signup/login.

---

#### `POST /api/auth/signup`

Create a new user account.

| Field | Type | Required |
|-------|------|----------|
| `username` | `string` | Yes |
| `password` | `string` | Yes |

**Response `201`**
```json
{
  "token": "eyJhbGci...",
  "user": { "_id": "...", "username": "..." }
}
```

---

#### `POST /api/auth/login`

Authenticate and receive a JWT.

| Field | Type | Required |
|-------|------|----------|
| `username` | `string` | Yes |
| `password` | `string` | Yes |

**Response `200`**
```json
{
  "token": "eyJhbGci...",
  "user": { "_id": "...", "username": "..." }
}
```

---

### Projects

**All project routes require authentication.**

#### `POST /api/workspace/createProject`

| Field | Type | Required |
|-------|------|----------|
| `title` | `string` | Yes |
| `description` | `string` | No |
| `imageLink` | `string` (URL) | No |
| `workers` | `string[]` (User IDs) | No |
| `maintainers` | `string[]` (User IDs) | No |

**Response `201`** — the created Project document:
```json
{
  "_id": "...",
  "title": "...",
  "description": "...",
  "created_by": "...",
  "workers": ["..."],
  "maintainers": ["..."],
  "status": "inProgress",
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

---

#### `POST /api/workspace/editProject`

| Field | Type | Required |
|-------|------|----------|
| `projectId` | `string` | Yes |
| `title` | `string` | No |
| `description` | `string` | No |
| `workers` | `string[]` | No |
| `maintainers` | `string[]` | No |
| `status` | `string` | No |

**Response `200`** — updated Project document.

---

#### `POST /api/workspace/deleteProject`

| Field | Type | Required |
|-------|------|----------|
| `projectId` | `string` | Yes |

**Response `200`**
```json
{ "message": "Project deleted" }
```

---

#### `GET /api/projects/created`

Projects where the authenticated user is the creator.

**Response `200`** — array of Project documents.

---

#### `GET /api/projects/involved`

Projects where the user is a worker or maintainer (excluding creator).

**Response `200`** — array of Project documents.

---

#### `GET /api/projects/all`

All projects the user is associated with (created, working, or maintaining).

**Response `200`** — array of Project documents.

---

### Issues

**All issue routes require authentication and a valid `projectId` (the user must be a worker, maintainer, or creator).**

#### `POST /api/issues/createIssue`

| Field | Type | Required |
|-------|------|----------|
| `projectId` | `string` | Yes (for authorization) |
| `title` | `string` | Yes |
| `description` | `string` | No |
| `assignedTo` | `string` (User ID) | No |
| `status` | `"OPEN"` / `"IN_PROGRESS"` / `"RESOLVED"` | No (default: `"OPEN"`) |
| `imageLink` | `string` (URL) | No |

**Response `201`** — the created Issue document:
```json
{
  "_id": "...",
  "project_id": "...",
  "title": "...",
  "description": "...",
  "image_link": "...",
  "created_by": "...",
  "assigned_to": "...",
  "status": "OPEN",
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

---

#### `POST /api/issues/editIssue`

| Field | Type | Required |
|-------|------|----------|
| `issueId` | `string` | Yes |
| `title` | `string` | No |
| `description` | `string` | No |
| `assignedTo` | `string` \| `null` | No |
| `status` | `"OPEN"` / `"IN_PROGRESS"` / `"RESOLVED"` | No |
| `imageLink` | `string` (URL) | No |

**Response `200`** — updated Issue document.

---

### Comments

**All comment routes require authentication.**

#### `POST /api/comments/createComment`

| Field | Type | Required |
|-------|------|----------|
| `issueId` | `string` | Yes |
| `content` | `string` | Yes |
| `mediaLinks` | `string[]` (URLs) | No |

**Response `201`** — the created Comment document:
```json
{
  "_id": "...",
  "issue_id": "...",
  "created_by": "...",
  "content": "...",
  "media_links": ["..."],
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:00:00.000Z"
}
```

---

#### `POST /api/comments/editComment`

| Field | Type | Required |
|-------|------|----------|
| `commentId` | `string` | Yes |
| `content` | `string` | No |
| `mediaLinks` | `string[]` | No |

**Response `200`** — updated Comment document.

---

#### `DELETE /api/comments/deleteComment`

| Field | Type | Required |
|-------|------|----------|
| `commentId` | `string` | Yes |

**Response `200`**
```json
{ "message": "Comment deleted successfully" }
```

---

### Blueprint (LLM)

**All blueprint routes require authentication.**

#### `POST /api/blueprint/convert`

Converts a text description (optionally with a reference image) into a structured blueprint JSON via Gemini.

| Field | Type | Required |
|-------|------|----------|
| `description` | `string` | Yes |
| `imageUrl` | `string` (public URL) | No |

**Response `200`**
```json
{
  "objects": [
    { "type": "wall", "start": [0, 0], "end": [10, 0], "height": 3 },
    { "type": "door", "position": [5, 0], "width": 1 },
    { "type": "window", "position": [2, 0], "width": 1.5 },
    { "type": "room", "corners": [[0, 0], [10, 0], [10, 8], [0, 8]], "height": 3 },
    { "type": "floor", "position": [5, 4], "width": 10, "depth": 8 }
  ]
}
```

---

### Users

**All user routes require authentication.** These endpoints are currently stubs.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/listUsers` | List users (not yet implemented) |
| `GET` | `/api/users/searchUsers` | Search users (not yet implemented) |
| `POST` | `/api/users/sendInvite` | Send invite (not yet implemented) |

---

### Route Summary

| Prefix | Auth Required | Endpoints |
|--------|--------------|-----------|
| `/api/auth` | No | `POST /login`, `POST /signup` |
| `/api/workspace` | Yes | `POST /createProject`, `POST /editProject`, `POST /deleteProject` |
| `/api/projects` | Yes | `GET /created`, `GET /involved`, `GET /all` |
| `/api/issues` | Yes (+ project authorization) | `POST /createIssue`, `POST /editIssue` |
| `/api/comments` | Yes | `POST /createComment`, `POST /editComment`, `DELETE /deleteComment` |
| `/api/blueprint` | Yes | `POST /convert` |
| `/api/users` | Yes | `GET /listUsers`, `GET /searchUsers`, `POST /sendInvite` |

