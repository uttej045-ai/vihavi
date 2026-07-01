import pytest

def test_register_success(client):
    payload = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "securepassword123",
        "role": "attendee",
        "phone": "1234567890"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 210 or response.status_code == 201
    # Check that HTTP_201_CREATED or status code in 200 range
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["name"] == payload["name"]
    assert data["role"] == "attendee"
    assert "id" in data
    assert data["is_active"] is True

def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "name": "Duplicate User",
        "password": "securepassword123",
        "role": "attendee"
    }
    # Register once
    response1 = client.post("/auth/register", json=payload)
    assert response1.status_code == 201

    # Register again with same email
    response2 = client.post("/auth/register", json=payload)
    assert response2.status_code == 409
    assert response2.json()["detail"] == "Email already registered"

def test_login_success(client):
    register_payload = {
        "email": "login@example.com",
        "name": "Login User",
        "password": "correctpassword",
        "role": "attendee"
    }
    # Register
    client.post("/auth/register", json=register_payload)

    # Login
    login_payload = {
        "email": "login@example.com",
        "password": "correctpassword"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["email"] == "login@example.com"
    assert data["name"] == "Login User"
    assert data["role"] == "attendee"
    assert data["token_type"] == "bearer"

def test_login_wrong_credentials(client):
    register_payload = {
        "email": "wronglogin@example.com",
        "name": "Wrong Login User",
        "password": "correctpassword",
        "role": "attendee"
    }
    # Register
    client.post("/auth/register", json=register_payload)

    # Login with wrong password
    login_payload = {
        "email": "wronglogin@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

    # Login with non-existent email
    login_payload = {
        "email": "nonexistent@example.com",
        "password": "somepassword"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_refresh_token_success(client):
    register_payload = {
        "email": "refresh@example.com",
        "name": "Refresh User",
        "password": "correctpassword",
        "role": "attendee"
    }
    client.post("/auth/register", json=register_payload)

    # Login to get refresh token
    login_payload = {
        "email": "refresh@example.com",
        "password": "correctpassword"
    }
    login_response = client.post("/auth/login", json=login_payload)
    assert login_response.status_code == 200
    tokens = login_response.json()
    refresh_token = tokens["refresh_token"]

    # Refresh token
    refresh_payload = {
        "refresh_token": refresh_token
    }
    response = client.post("/auth/refresh", json=refresh_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

def test_refresh_token_invalid(client):
    refresh_payload = {
        "refresh_token": "invalid_refresh_token_string"
    }
    response = client.post("/auth/refresh", json=refresh_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid refresh token"

def test_logout(client):
    response = client.post("/auth/logout")
    assert response.status_code == 200
    assert response.json() == {"message": "Logged out successfully"}
