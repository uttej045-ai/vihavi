def test_health_check(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "app" in data
    assert "version" in data

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_list_categories_default(client):
    response = client.get("/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) > 0
    # The default list has "Music"
    assert categories[0]["name"] == "Music"

def test_recommended_events_empty(client):
    response = client.get("/recommendedEvents")
    assert response.status_code == 200
    assert response.json() == []
